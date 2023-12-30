// 이 컨트랙트는 도지사운드클럽 메이트 NFT의 유동성을 높이기 위해 작성되었습니다.
// 도지사운드클럽 메이트 NFT를 본 컨트랙트로 입금할 경우, 대응하는 ERC-20 토큰 ~MATE 발행하여 보유할 수 있으며,
// 반대로 다시 ERC-20 토큰 ~MATE를 소각하면 메이트 NFT를 되돌려 받을 수 있게 하는 컨트랙트입니다. 
//
// 유동성을 위해 입금되는 메이트 NFT를 모두 동일한 NFT로 간주합니다.
// 되돌려 받는 메이트 NFT의 번호는 입금한 메이트 NFT의 번호와 동일하지 않으므로 주의가 필요합니다.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin 라이브러리에서 필요한 컨트랙트를 임포트
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ERC20 토큰과 Ownable 기능을 가진 WateringMate 컨트랙트 정의
contract WateringMate is ERC20, Ownable {
    // NFT 컨트랙트 주소를 저장할 변수
    IERC721 public immutable nftToken;

    // NFT 하나당 발행되는 토큰의 양 (1:1 페깅)
    uint256 public constant FT_PER_NFT = 1000000000000000000;

    // 입금된 NFT의 총 수를 추적하는 변수
    uint256 public totalDepositedNfts = 0;

    // 한 번의 트랜잭션에서 처리할 수 있는 최대 NFT 수
    uint256 public maxNftsPerTx;

    // 입금된 NFT ID를 저장할 배열
    uint256[] private nftIds;

    // 컨트랙트 생성자
    constructor(address _nftTokenAddress, uint256 _maxNftsPerTx)
        ERC20("Watering Mate", "~MATE") // ERC20 토큰 이름과 심볼 설정
        Ownable(msg.sender) // 오너 설정
    {
        nftToken = IERC721(_nftTokenAddress); // NFT 컨트랙트 주소 설정
        maxNftsPerTx = _maxNftsPerTx; // 최대 NFT 처리 수 설정
    }

    // NFT를 입금하여 ~MATE 토큰을 받는 함수
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

    // ~MATE 토큰을 사용하여 NFT를 인출하는 함수
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
