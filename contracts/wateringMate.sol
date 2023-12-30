// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WateringMate is ERC20, Ownable {
    IERC721 public immutable nftToken;
    uint256 public constant FT_PER_NFT = 1000000000000000000;
    uint256 public totalDepositedNfts = 0;
    uint256 public maxNftsPerTx; // 수정 가능한 변수로 변경

    uint256[] private nftIds;

    constructor(address _nftTokenAddress, uint256 _maxNftsPerTx)
        ERC20("Watering Mate", "~MATE")
        Ownable(msg.sender)
    {
        nftToken = IERC721(_nftTokenAddress);
        maxNftsPerTx = _maxNftsPerTx;
    }

    function depositNFTs(uint256[] calldata nftIdsToDeposit) external {
        require(nftIdsToDeposit.length <= maxNftsPerTx, "Too many NFTs");
        address expectedNFTAddress = 0xE47E90C58F8336A2f24Bcd9bCB530e2e02E1E8ae;
        for (uint256 i = 0; i < nftIdsToDeposit.length; i++) {
            uint256 nftId = nftIdsToDeposit[i];
            require(nftToken.ownerOf(nftId) == msg.sender, "You must own the NFT");
            require(address(nftToken) == expectedNFTAddress, "This NFT is not supported");
            nftToken.transferFrom(msg.sender, address(this), nftId);
            nftIds.push(nftId);
        }
        _mint(msg.sender, FT_PER_NFT * nftIdsToDeposit.length);
        totalDepositedNfts += nftIdsToDeposit.length;
        
    }

    function withdrawNFTs(uint256 numberOfNfts) external {
        require(numberOfNfts <= maxNftsPerTx, "Too many NFTs");
        require(numberOfNfts > 0, "Number of NFTs must be greater than 0");
        require(nftIds.length >= numberOfNfts, "Not enough NFTs available to withdraw");
        require(balanceOf(msg.sender) >= FT_PER_NFT * numberOfNfts, "Insufficient ~MATE balance");

        for (uint256 i = 0; i < numberOfNfts; i++) {
            uint256 lastIndex = nftIds.length - 1;
            uint256 nftId = nftIds[lastIndex];
            nftIds.pop();
            nftToken.transferFrom(address(this), msg.sender, nftId);
        }
        _burn(msg.sender, FT_PER_NFT * numberOfNfts);
        totalDepositedNfts -= numberOfNfts;
    }

    // 오너만이 maxNftsPerTx 값을 수정할 수 있는 함수
    function setMaxNftsPerTx(uint256 _maxNftsPerTx) external onlyOwner {
        maxNftsPerTx = _maxNftsPerTx;
    }
}
