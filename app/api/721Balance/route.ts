import { NextRequest, NextResponse } from 'next/server';
import { ethers } from "ethers";
import MateContractABI from '@/contracts/MateContractABI.json';

export async function GET(req: NextRequest, res: NextResponse) {
  const url = new URL(req.url);
  console.log("url.searchParams.get('walletAddress')", url.searchParams.get('walletAddress'));

  const page = parseInt(url.searchParams.get('page') || '0');
  const pageSize = 10; // Or any other number

  const walletAddress = url.searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({
      statusCode: 400,
      message: 'Missing request body'
    });
  }

  const provider = new ethers.JsonRpcProvider('https://public-en-cypress.klaytn.net');
  const contractAddress = '0xe47e90c58f8336a2f24bcd9bcb530e2e02e1e8ae';

  const MateContract = new ethers.Contract(contractAddress, MateContractABI, provider);

  try {
    const balance = await MateContract.balanceOf(walletAddress);
    const balanceNumber = Number(balance);
    console.log('balance:', balance);
    console.log('balanceNumber:', balanceNumber);

    const nftIds: string[] = [];

    // Start from the index based on the page number
    const start = page * pageSize;
    const end = Math.min(start + pageSize, balanceNumber);

    for (let i = start; i < end; i++) {
      const id: string = await MateContract.tokenOfOwnerByIndex(walletAddress, i);
      nftIds.push(id.toString());
    }

    return NextResponse.json({
      statusCode: 200,
      data: { balanceNumber, nftIds },
      message: "200 OK"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      statusCode: 500,
      message: error.message
    });
  }
}