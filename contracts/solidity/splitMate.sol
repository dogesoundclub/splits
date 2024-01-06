// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SplitMate is ERC20, Ownable, ERC20Permit {
    IERC721 public immutable nftToken;
    uint256 public constant SPLIT_MATE_PER_NFT = 1000000000000000000;
    uint256 public totalDepositedNfts = 0;

    mapping(uint256 => bool) private nftDeposited;

    event NFTDeposited(address indexed depositor, uint256 indexed nftId);
    event NFTWithdrawn(address indexed withdrawer, uint256 indexed nftId);

    constructor(address _nftTokenAddress)
        ERC20("SplitCat Mate", "SplitCat MATE")
        ERC20Permit("SplitCat Mate")
        Ownable(msg.sender)
    {
        nftToken = IERC721(_nftTokenAddress);
    }

    function depositNFTs(uint256[] calldata nftIdsToDeposit) external {
        require(nftIdsToDeposit.length > 0, "Must deposit at least one NFT");
        for (uint256 i = 0; i < nftIdsToDeposit.length; i++) {
            uint256 nftId = nftIdsToDeposit[i];
            require(nftToken.ownerOf(nftId) == msg.sender, "You must own the NFT");
            require(!nftDeposited[nftId], "NFT is already deposited");

            // 상태 변경
            nftDeposited[nftId] = true;
        }
        
        // 상태 변경 후 외부 호출
        for (uint256 i = 0; i < nftIdsToDeposit.length; i++) {
            nftToken.transferFrom(msg.sender, address(this), nftIdsToDeposit[i]);
            emit NFTDeposited(msg.sender, nftIdsToDeposit[i]);
        }

        _mint(msg.sender, SPLIT_MATE_PER_NFT * nftIdsToDeposit.length);
        totalDepositedNfts += nftIdsToDeposit.length;
    }

    function withdrawNFTs(uint256[] calldata nftIdsToWithdraw) external {
        require(nftIdsToWithdraw.length > 0, "Must withdraw at least one NFT");
        require(balanceOf(msg.sender) >= SPLIT_MATE_PER_NFT * nftIdsToWithdraw.length, "Insufficient MATE balance");

        uint256 amountToBurn = SPLIT_MATE_PER_NFT * nftIdsToWithdraw.length;

        // 상태 변경
        for (uint256 i = 0; i < nftIdsToWithdraw.length; i++) {
            uint256 nftId = nftIdsToWithdraw[i];
            require(nftDeposited[nftId], "NFT not deposited");

            nftDeposited[nftId] = false;
            totalDepositedNfts--;
        }

        _burn(msg.sender, amountToBurn);

        // 상태 변경 후 외부 호출
        for (uint256 i = 0; i < nftIdsToWithdraw.length; i++) {
            nftToken.transferFrom(address(this), msg.sender, nftIdsToWithdraw[i]);
            emit NFTWithdrawn(msg.sender, nftIdsToWithdraw[i]);
        }
    }
}
