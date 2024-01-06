"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useSendTransaction, useWaitForTransaction, useAccount } from 'wagmi';
import { Slider, Box, Checkbox, Flex, ScrollArea, Card, Avatar, Button, Dialog, Text, TextField } from "@radix-ui/themes";

export default function IndexPage() {
    const { address, isConnected } = useAccount();
    const [isSpliting, setIsSpliting] = useState(false);
    const [splitMessage, setSplitMessage] = useState('');
    const { sendTransaction } = useSendTransaction();

    const [isLoading, setIsLoading] = useState(true);
    const [allNftsLoaded, setAllNftsLoaded] = useState(false);
    const [nftIds, setNftIds] = useState<string[]>([]);
    const [offset, setOffset] = useState(0);
    const loadCount = 10;
    const [sliderValue, setSliderValue] = useState([0]);
    const [checkboxes, setCheckboxes] = useState(new Array(10).fill(false));
    const [balance, setBalance] = useState(0);
    const selected = checkboxes.filter(checkbox => checkbox).length;

    const fetchNfts = async () => {
        if (!address || !isConnected || allNftsLoaded) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/erc721Balance?walletAddress=${address}&offset=${offset}&count=${loadCount}`);
            const responseData = await response.json();
            if (responseData.statusCode === 200) {
                setNftIds(prevNfts => [...prevNfts, ...responseData.data.nftIds]);
                setBalance(responseData.data.balanceNumber);
                setAllNftsLoaded(responseData.data.nftIds.length < loadCount || nftIds.length + responseData.data.nftIds.length >= responseData.data.balanceNumber);
            } else {
                console.error('Error fetching NFTs:', responseData.message);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNfts();
    }, [offset, address, isConnected]);

    const handleScroll = (event) => {
        const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
        if (scrollHeight - scrollTop === clientHeight) {
            setOffset(prevOffset => prevOffset + loadCount);
        }
        console.log("handScroll Event, offset:", offset);
    };

    const handleCheckboxChange = (index) => {
        setCheckboxes((prev) => prev.map((checked, i) => (i === index ? !checked : checked)));
    };

    const handleSliderChange = (value) => {
        setSliderValue(value);
        setCheckboxes(new Array(value[0]).fill(true).concat(new Array(checkboxes.length - value[0]).fill(false)));
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
    }, [address, nftIds.length, sendTransaction]);

    return (
        <>
            <section id="split" className="pt-6">
                <div className="container flex w-full flex-col items-center gap-4 text-center">
                    <div className="rounded-2xl bg-muted flex px-4 py-1.5 text-lg font-heading">
                        SPLIT <div style={{ color: '#BFC500' }}>&nbsp;MATE</div>
                    </div>
                    <ScrollArea onScroll={handleScroll} type="always" scrollbars="vertical" style={{ margin: "auto", height: 360, width: 330 , display: 'flex', justifyContent: 'center',justifyItems:"center", alignItems: 'center' }}>
                      {nftIds && nftIds.map((nftId, index) => (
                        // <Card key={nftId} style={{ width: 300, margin: 'auto' }}>
                        <Card key={`${nftId}-${index}`} style={{ width: 300 }}>
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
                              <Text
                                className="font-heading" 
                                as="div" size="2" weight="bold">
                                DOGESOUNDCLUB MATE
                              </Text>
                              <Text 
                                className="font-heading"                         
                                as="div" size="2" color="gray">
                              #{nftId}
                              </Text>
                            </Box>
                          </Flex>     
                          </Flex>        
                        </Card>
                      ))}
                      {isLoading && <div style={{ textAlign: 'center', marginTop: '10px' }}>Loading...</div>}
                      {allNftsLoaded && !isLoading && <div style={{ textAlign: 'center', marginTop: '10px' }}>All NFTs loaded</div>}
                    </ScrollArea>
                    <div className="w-full flex justify-between items-center gap-2" style={{ maxWidth: 300 }}>
                    <Slider max={nftIds.length} step={1} value={sliderValue} onValueChange={handleSliderChange} />
                      <div className="text-right font-heading text-sm">
                          {selected} / {balance} SELECTED
                      </div>
                    </div>
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <Button className="mt-4" style={{ backgroundColor: 'white', color: 'black', border: '1px solid var(--color-input)', cursor: 'pointer' }}>SPLIT</Button>
                        </Dialog.Trigger>
                        <Dialog.Content style={{ maxWidth: 450, textAlign: "center" }}>
                            <Dialog.Title className="font-heading">SPLIT MATE</Dialog.Title>
                            <Dialog.Description className="mb-4 font-heading size-2">Are you sure you want to split MATE?</Dialog.Description>
                            <Flex direction="column" gap="3">
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">Split MATES</Text>
                                    <TextField.Input value={nftIds.join(', ')} readOnly style={{ height: "45px" }} />
                                </label>
                            </Flex>
                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button variant="soft" color="gray">CANCEL</Button>
                                </Dialog.Close>
                                <Dialog.Close>
                                    <Button onClick={onSplit} style={{ backgroundColor: 'white', color: 'black', border: '1px solid var(--color-input)', cursor: 'pointer' }}>SPLIT</Button>
                                </Dialog.Close>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Root>
                </div>
            </section>
        </>
    );
}
