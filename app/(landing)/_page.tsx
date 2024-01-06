"use client";
// import { useState, useEffect } from "react"
// import { ethers } from "ethers";
// import { useAccount } from "wagmi"
// import Link from "next/link"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
// import { Slider } from "@/components/ui/slider"
// import { Checkbox } from "@/components/ui/checkbox";
// import { buttonVariants } from "@/components/ui/button"
import { Erc721to20 } from "@/components/erc721to20"
import { Text, Box, Tabs } from "@radix-ui/themes"

export default function IndexPage() {
  <>
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <Tabs.Root defaultValue="split">
        <Tabs.List>
          <Tabs.Trigger value="split">Split</Tabs.Trigger>
          <Tabs.Trigger value="cat">Documents</Tabs.Trigger>
        </Tabs.List>

        <Box px="4" pt="3" pb="2">
          <Tabs.Content value="split">
            <Text size="2">Make changes to your account.</Text>
            <Erc721to20 />
          </Tabs.Content>

          <Tabs.Content value="cat">
            <Text size="2">Access and update your documents.</Text>
          </Tabs.Content>
        </Box>
    </Tabs.Root>
    </section>
  </>
}