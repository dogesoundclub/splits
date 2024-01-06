"use client";

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import Link from "next/link"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox";
import { buttonVariants } from "@/components/ui/button"
import { Text, Flex, ScrollArea, Box, Card, Avatar } from "@radix-ui/themes"

const Erc721to20 = () => {
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { address, isConnected } = useAccount();
    const [nftIds, setNftIds] = useState([]);
    const [sliderValue, setSliderValue] = useState([0]);
    const [checkboxes, setCheckboxes] = useState(new Array(10).fill(false));
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const selected = checkboxes.filter(checkbox => checkbox).length;
  
    useEffect(() => {
      const fetchBalanceAndNftIds = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/721Balance?walletAddress=${address}&page=${page}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const responseData = await response.json();
          if (responseData.statusCode === 200) {
            setBalance(responseData.data.balanceNumber);
            console.log("your nft balance:", responseData.data.balanceNumber);
            setNftIds(responseData.data.nftIds);
            console.log("your nft ids:", responseData.data.nftIds)
            setCheckboxes(new Array(responseData.data.nftIds.length).fill(false));
          } else {
            // Handle other status codes or errors
            console.error('Error fetching inscripters:', responseData.message);
          }
        } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
        } finally {
          setIsLoading(false);
        }
      };
    
      fetchBalanceAndNftIds();
    }, [address, isConnected]);
  
    const handleCheckboxChange = (index) => {
      setCheckboxes((prev) => prev.map((checked, i) => (i === index ? !checked : checked)));
    };
  
    // This function is triggered when the slider value changes
    const handleSliderChange = (value) => {
      setSliderValue(value);
      // Update the checkboxes based on the slider value
      const newCheckboxes = checkboxes.map((_, index) => index < value[0]);
      setCheckboxes(newCheckboxes);
    };
  
    return (
      <>
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-scale-down text-center font-heading text-xl lg:text-6xl">Split Mate</h1>
            <ScrollArea type="always" scrollbars="vertical" style={{ height: 360, maxWidth: 240 }}>
              {nftIds && nftIds.map((nftId, index) => (
                <Card key={nftId} style={{ maxWidth: 240 }}>
                                  <Flex gap="3" align="center">
                  <Checkbox checked={checkboxes[index]} onChange={() => handleCheckboxChange(index)}>                </Checkbox>  
                  <Flex gap="3" align="center">
  
                    <Avatar
                      size="3"
                      src="/images/mates/dscMate-0.png?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
                      radius="full"
                      fallback="T"
                    />
                    <Box>
                      <Text as="div" size="2" weight="bold">
                      MATE
                      </Text>
                      <Text as="div" size="2" color="gray">
                      #{nftId}
                      </Text>
                    </Box>
                  </Flex>     
                  </Flex>        
                </Card>
              ))}
            </ScrollArea>
            <h2 className="font-heading"> {selected} / {balance} SELECTED </h2>
            <Slider max={nftIds.length} step={1} value={sliderValue} onValueChange={handleSliderChange} style={{ maxWidth: 240 }}/>
          </div>
        </section>
        <section
          id="features"
          className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
        </section>
      </>
    )
  }

export { Erc721to20 };
