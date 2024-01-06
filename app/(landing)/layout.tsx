"use client"

import { useEffect, useState } from "react"

import Link from "next/link"

import { landingConfig } from "@/config/landing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { useAccount } from 'wagmi';
import { ConnectButton } from "@/components/ui/wallet-connect-btn" 

interface LandingLayoutProps {
  children: React.ReactNode
}

export default function LandingLayout({
  children,
}: LandingLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { address, isConnected } = useAccount();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={landingConfig.mainNav} />
        </div>
      </header>
      <div className={
        isMobile? "scale-[0.9] fixed right-0 flex-col sm:h-20 lg:h-12 items-end justify-end py-4 mr-2 z-50" :
                  "scale-[1] fixed right-0 flex-col sm:h-20 lg:h-12 items-end justify-end py-2 mr-4 z-50"}>
        <ConnectButton/>
        
        {/* {isMobile? "" : <div className="w-3"></div>}
        <div className="flex justify-end mr-4 font-proto-mono">
          {isConnected && (
            <div className="flex">
              You have  
              <div className="text-monkeyGreen ml-2 mr-2">
                {new Intl.NumberFormat().format(data.balance)}
              </div>
              Split Mate
              <div className="ml-2">
                <SvgImages.kroCoinIcon/>
              </div>
            </div>
          )}
        </div> */}
      </div>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}