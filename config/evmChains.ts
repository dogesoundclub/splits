// scripts-kroma/evmChains.ts
import { Chain } from 'wagmi/chains';

const klaytnMainnet: Chain = {
  id: 8217, // Chain ID for Kroma Mainnet
  network: 'klaytn',
  name: 'Klaytn Mainnet',
  nativeCurrency: {
    name: 'Klay',
    symbol: 'KLAY', // Currency Symbol
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-cypress.klaytn.net'], // RPC URL
    },
    public: {
      http: ['https://public-en-cypress.klaytn.net'], // RPC URL
    },
  },
  blockExplorers: {
    default: {
      name: 'Scope',
      url: 'https://klaytnscope.com/', // Block Explorer URL
    },
  },
};

export const evmChains = [klaytnMainnet];
