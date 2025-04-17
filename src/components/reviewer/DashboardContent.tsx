'use client';

import { useEffect, useState } from "react";
import { useReviewerDashboard } from "@/hooks/use-reviewer-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProposalReviewItem } from "@/components/reviewer/proposal-review-item";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProposalData {
  id?: string;
  id_proposal?: number;
  status_penilaian?: string;
  review_status?: string;
  isReviewed?: boolean;
  [key: string]: any;
}

interface DashboardContentProps {
  userId: string;
}

export function ReviewerDashboardContent({ userId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("unreviewed");
  
  // Simpan userId ke localStorage saat komponen dimount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Pastikan userId selalu memiliki nilai yang valid
      const safeUserId = userId || '';
      console.log('Menyimpan userId ke localStorage:', safeUserId);
      localStorage.setItem('userId', safeUserId);
    }
  }, [userId]);
  
  const { proposals, isLoading, error } = useReviewerDashboard(userId);
  
  // Buat fungsi yang lebih bersih untuk filter proposal
  const getFilteredProposals = () => {
    if (!proposals || !Array.isArray(proposals)) return { unreviewedProposals: [], reviewedProposals: [] };
    
    const unreviewedProposals: ProposalData[] = [];
    const reviewedProposals: ProposalData[] = [];
    
    proposals.forEach(proposal => {
      if (!proposal) return;
      
      // Type assertion untuk property yang tidak dikenal dalam tipe asli
      const p = proposal as unknown as ProposalData;
      
      // Cek status review dengan cara yang lebih bersih
      const isReviewed = 
        p.isReviewed === true || 
        p.review_status === 'reviewed' || 
        p.status_penilaian === 'reviewed';
        
      if (isReviewed) {
        reviewedProposals.push(p);
      } else {
        unreviewedProposals.push(p);
      }
    });
    
    return { unreviewedProposals, reviewedProposals };
  };
  
  const { unreviewedProposals, reviewedProposals } = getFilteredProposals();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Memuat data proposal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">
            Terjadi kesalahan saat memuat data: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render komponen dengan data terfilter
  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Daftar Proposal</span>
          <Badge variant="outline" className="ml-2">
            Total: {proposals?.length || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="unreviewed" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Belum Direview ({unreviewedProposals.length})
            </TabsTrigger>
            <TabsTrigger 
              value="reviewed" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Sudah Direview ({reviewedProposals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unreviewed">
            {unreviewedProposals.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  Tidak ada proposal yang perlu direview saat ini.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-4">
                  {unreviewedProposals.map((proposal) => (
                    <ProposalReviewItem 
                      key={proposal.id || proposal.id_proposal || `unreviewed-${Math.random()}`} 
                      proposal={proposal} 
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="reviewed">
            {reviewedProposals.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  Belum ada proposal yang sudah direview.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-4">
                  {reviewedProposals.map((proposal) => (
                    <ProposalReviewItem 
                      key={proposal.id || proposal.id_proposal || `reviewed-${Math.random()}`}
                      proposal={proposal} 
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 