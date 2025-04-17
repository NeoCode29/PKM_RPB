'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BidangPkm } from '@/services/bidang-pkm-service';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BidangPkmTabsProps {
  bidangList: BidangPkm[];
  activeBidang: number | null;
  onChangeBidang: (bidangId: number) => void;
  children: (bidangPkmId: number, bidangName: string) => React.ReactNode;
}

export const BidangPkmTabs: React.FC<BidangPkmTabsProps> = ({
  bidangList,
  activeBidang,
  onChangeBidang,
  children
}) => {
  if (bidangList.length === 0) {
    return <div className="text-center py-4">Tidak ada data bidang PKM</div>;
  }

  const handleValueChange = (value: string) => {
    onChangeBidang(parseInt(value));
  };

  const activeBidangValue = activeBidang?.toString() || bidangList[0].id_bidang_pkm.toString();

  return (
    <Tabs 
      value={activeBidangValue}
      onValueChange={handleValueChange}
      defaultValue={bidangList[0].id_bidang_pkm.toString()}
      className="w-full"
    >
      <div className="relative w-full overflow-auto">
        <ScrollArea className="w-full">
          <TabsList className="mb-4 inline-flex h-10 w-auto">
            {bidangList.map((bidang) => (
              <TabsTrigger 
                key={bidang.id_bidang_pkm} 
                value={bidang.id_bidang_pkm.toString()}
                className="min-w-24"
              >
                {bidang.nama}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
      </div>

      {bidangList.map((bidang) => (
        <TabsContent key={bidang.id_bidang_pkm} value={bidang.id_bidang_pkm.toString()}>
          {children(bidang.id_bidang_pkm, bidang.nama || '')}
        </TabsContent>
      ))}
    </Tabs>
  );
}; 