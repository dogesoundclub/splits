"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { evmChains } from '../config/evmChains';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'd8d879238c3a19195186c1e9a0d5a561'

// 2. Create wagmiConfig
const metadata = {
  name: 'split',
  description: 'Interpreter For Web3 Inscriptions',
  url: 'https://split.cat',
  icons: ['https://split.cat/android-chrome-512x512.png']
}

const chains = evmChains
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'ProtoMono-SemiBold',
    '--w3m-accent': '#45d620',
  }
})

export function Web3Modal({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}