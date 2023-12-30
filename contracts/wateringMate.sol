// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WateringMate is ERC20, Ownable {
    IERC721 public immutable nftToken;

    mapping(uint256 => address) public nftDepositors;
    uint256 public constant MATE_PER_NFT = 1000000000000000000;

    constructor(address _nftTokenAddress)
        ERC20("Watering Mate", "~MATE")
        Ownable(msg.sender)
    {
        nftToken = IERC721(_nftTokenAddress);
    }

    function depositNFT(uint256 nftId) external {
        address expectedNFTAddress = 0xE47E90C58F8336A2f24Bcd9bCB530e2e02E1E8ae;
        require(nftToken.ownerOf(nftId) == msg.sender, "You must own the NFT");
        require(address(nftToken) == expectedNFTAddress, "This NFT is not supported");
        nftToken.transferFrom(msg.sender, address(this), nftId);
        nftDepositors[nftId] = msg.sender;
        _mint(msg.sender, MATE_PER_NFT);
    }

    function withdrawNFT(uint256 nftId) external {
        require(nftDepositors[nftId] == msg.sender, "You are not the depositor");
        require(balanceOf(msg.sender) >= MATE_PER_NFT, "Insufficient MATE balance");
        _burn(msg.sender, MATE_PER_NFT);
        nftToken.transferFrom(address(this), msg.sender, nftId);
        delete nftDepositors[nftId];
    }
}
