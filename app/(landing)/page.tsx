"use client";

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
    useSendTransaction,
    useWaitForTransaction,
    useAccount,
    useChainId,
  } from 'wagmi';

import Link from "next/link"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox";
import { buttonVariants } from "@/components/ui/button"
import { Text, TextField, Flex, ScrollArea, Box, Card, Avatar, Button, Dialog } from "@radix-ui/themes"
import { AlignJustify } from "lucide-react";


export default function IndexPage() {
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const { address, isConnected } = useAccount();
    const [isSpliting, setIsSpliting] = useState(false);
    const [splitMessage, setSplitMessage] = useState('');

    const { data, error, isError, sendTransaction } = useSendTransaction();
    const { isLoading: isPending, isSuccess } = useWaitForTransaction({ hash: data?.hash });
    const chainId = useChainId();
    const account = useAccount();

    const [nftIds, setNftIds] = useState<string[]>([]); // or useState<number[]>([]) if your IDs are numbers
    const [offset, setOffset] = useState(0); // Used for pagination
    const loadCount = 10;  // Number of NFTs to load each time

    const [sliderValue, setSliderValue] = useState([0]);
    const [checkboxes, setCheckboxes] = useState(new Array(10).fill(false));
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const selected = checkboxes.filter(checkbox => checkbox).length;
  
    // useEffect(() => {
    const init = async () => {
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
    }

    useEffect(() => {
        init();
        }, [page]);

    const fetchMoreNfts = async () => {
        if (!address || !isConnected) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/721Balance?walletAddress=${address}&offset=${offset}&count=${loadCount}`);
            const responseData = await response.json();
            if (responseData.statusCode === 200) {
                setBalance(responseData.data.balanceNumber);
                setNftIds(prevNfts => [...prevNfts, ...responseData.data.nftIds]);
                setCheckboxes(prev => [...prev, ...new Array(responseData.data.nftIds.length).fill(false)]);
            } else {
                console.error('Error fetching NFTs:', responseData.message);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle scroll event
    const handleScroll = (event) => {
        const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;

        // Check if the user has scrolled to the bottom
        if (scrollHeight - scrollTop === clientHeight) {
            setOffset(prevOffset => prevOffset + loadCount); // Increase offset to load next set of NFTs
        }
    };

    // Fetch more NFTs when offset changes
    useEffect(() => {
        fetchMoreNfts();
    }, [offset]);
  
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

    const onSplit = useCallback(async () => {
        if (!address || isConnected) {
          alert('You must connect your wallet to mint.');
          return;
        }
    
        setIsSpliting(true);
    
        try {
          // Send the transaction
          await sendTransaction({
            to: address,
            // data: ``
          });
      
          // Set a message indicating the transaction is in progress
          // Note: You'll need to rely on another method to track the actual transaction status
          setSplitMessage('Transaction in progress...');
        } catch (e) {
          setSplitMessage(`Error: ${(e as Error).message}`);
        } finally {
          setIsSpliting(false);
        }
      }, [account, nftIds.length, sendTransaction]);
  
    return (
      <>
        <section id="split" className="pt-6">
          <div className="container flex w-full flex-col items-center gap-4 text-center">
            <div className="rounded-2xl bg-muted flex px-4 py-1.5 text-lg font-heading">
            SPLIT <div style={{ color: '#BFC500' }}>&nbsp;MATE</div>
            </div>
            {/* <Box style={{ justifyContent: 'center',justifyItems:"center", alignItems: 'center' }}> */}

            <ScrollArea type="always" scrollbars="vertical" style={{ margin: "auto", height: 360, width: 300 , display: 'flex', justifyContent: 'center',justifyItems:"center", alignItems: 'center' }}>
              {nftIds && nftIds.map((nftId, index) => (
                // <Card key={nftId} style={{ width: 270, margin: 'auto' }}>
                <Card key={nftId} style={{ width: 270 }}>
                <Flex gap="3" align="center">
                  <Checkbox checked={checkboxes[index]} onChange={() => handleCheckboxChange(index)}></Checkbox>  
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
            <Slider max={nftIds.length} step={1} value={sliderValue} onValueChange={handleSliderChange} style={{ width: 270 }}/>
            {/* </Box>             */}
            <div className="flex flex-col items-center gap-4">
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button
                            type="button"
                            size="4"
                            style={{
                                marginTop: '24px',
                                backgroundColor: 'white',
                                color: 'black',
                                border: '1px solid var(--color-input)',
                                cursor: 'pointer',
                            }}
                            >
                        SPLIT
                        </Button>
                    </Dialog.Trigger>

                    <Dialog.Content
                        className="font-heading" 
                        style={{ maxWidth: 450 }}>
                    <Dialog.Title
                        className="font-heading"
                        style={{textAlign:"center"}}>SPLIT MATE</Dialog.Title>
                    <Dialog.Description
                        className="font-heading" 
                        size="2" mb="4"
                        style={{textAlign:"center"}}>
                        Are you sure you want to split MATE?
                    </Dialog.Description>

                    <Flex direction="column" gap="3">
                        <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Split MATES
                        </Text>
                        <TextField.Input
                            value={nftIds}
                            readOnly
                            style={{textAlign:"center", height: "45px",}}
                        />
                        </label>
                    </Flex>

                    <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                        <Button variant="soft" color="gray"
                            type="button"
                            size="4"
                        >CANCEL</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                        <Button onClick={onSplit}
                            type="button"
                            size="4"
                            style={{
                            opacity: 1,
                            pointerEvents: 'auto',
                            backgroundColor: 'white',
                            color: 'black',
                            border: '1px solid var(--color-input)',
                            cursor: 'pointer',
                            ...({ ':hover': { backgroundColor: 'var(--color-primary/90)' } }) }}
                        >SPLIT</Button>
                        </Dialog.Close>
                    </Flex>
                    </Dialog.Content>
                </Dialog.Root></div>
          </div>
        </section>
        
        {/* <section
          id="features"
          className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
        </section> */}
      </>
      );
}