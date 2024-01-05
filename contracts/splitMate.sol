// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SplitMate is ERC20, Ownable {
    IERC721 public immutable nftToken;
    uint256 public constant MATE_PER_NFT = 1000000000000000000;
    uint256 public totalDepositedNfts = 0;

    mapping(uint256 => bool) private nftDeposited;

    // 이벤트 정의
    event NFTDeposited(address indexed depositor, uint256 indexed nftId);
    event NFTWithdrawn(address indexed withdrawer, uint256 indexed nftId);

    constructor(address _nftTokenAddress)
        ERC20("Split Mate", "Split MATE")
        Ownable(msg.sender)
    {
        nftToken = IERC721(_nftTokenAddress);
    }

    function depositNFTs(uint256[] calldata nftIdsToDeposit) external {
        require(nftIdsToDeposit.length > 0, "Must deposit at least one NFT");
        address expectedNFTAddress = 0xE47E90C58F8336A2f24Bcd9bCB530e2e02E1E8ae;
        for (uint256 i = 0; i < nftIdsToDeposit.length; i++) {
            uint256 nftId = nftIdsToDeposit[i];
            require(nftToken.ownerOf(nftId) == msg.sender, "You must own the NFT");
            require(!nftDeposited[nftId], "NFT is already deposited");

            nftToken.transferFrom(msg.sender, address(this), nftId);
            nftDeposited[nftId] = true;
            emit NFTDeposited(msg.sender, nftId); // 이벤트 발생
        }
        _mint(msg.sender, MATE_PER_NFT * nftIdsToDeposit.length);
        totalDepositedNfts += nftIdsToDeposit.length;
    }

    function withdrawNFTs(uint256[] calldata nftIdsToWithdraw) external {
        require(nftIdsToWithdraw.length > 0, "Must withdraw at least one NFT");
        require(balanceOf(msg.sender) >= MATE_PER_NFT * nftIdsToWithdraw.length, "Insufficient MATE balance");

        for (uint256 i = 0; i < nftIdsToWithdraw.length; i++) {
            uint256 nftId = nftIdsToWithdraw[i];
            require(nftDeposited[nftId], "NFT not deposited");

            nftToken.transferFrom(address(this), msg.sender, nftId);
            nftDeposited[nftId] = false;
            emit NFTWithdrawn(msg.sender, nftId);
        }
        _burn(msg.sender, MATE_PER_NFT * nftIdsToWithdraw.length);
        totalDepositedNfts -= nftIdsToWithdraw.length;
    }
}
