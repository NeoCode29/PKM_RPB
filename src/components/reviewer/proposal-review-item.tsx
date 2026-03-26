'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ProposalWithRelations } from "@/types/proposal";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface ProposalReviewData {
  id?: string;
  id_proposal?: number;
  title?: string;
  judul?: string;
  bidang?: string;
  created_at?: string;
  review_status?: string;
  status_penilaian?: string;
  submitter?: { name?: string };
  mahasiswa?: { nama?: string };
  bidang_pkm?: { nama?: string };
}

interface ProposalReviewItemProps {
  proposal: ProposalWithRelations | ProposalReviewData;
}

export function ProposalReviewItem({ proposal }: ProposalReviewItemProps) {
  const router = useRouter();

  // Fungsi untuk memastikan properti yang tepat digunakan
  const getProposalTitle = (): string => {
    const p = proposal as ProposalReviewData;
    return p.title || p.judul || "Judul tidak tersedia";
  };

  const getSubmitterName = (): string => {
    const p = proposal as ProposalReviewData;
    if (p.submitter?.name) {
      return p.submitter.name;
    }
    return p.mahasiswa?.nama || "Nama tidak tersedia";
  };

  const getBidang = (): string => {
    const p = proposal as ProposalReviewData;
    return p.bidang || p.bidang_pkm?.nama || "Bidang tidak tersedia";
  };

  const getCreatedDate = (): string => {
    return proposal.created_at || "Tanggal tidak tersedia";
  };

  const getReviewStatus = () => {
    const p = proposal as ProposalReviewData;
    const status = p.review_status || p.status_penilaian;
    if (status === "reviewed") {
      return <Badge className="ml-2 bg-green-500">Sudah direview</Badge>;
    }
    return <Badge className="ml-2 bg-yellow-500">Belum direview</Badge>;
  };

  const handleReview = () => {
    const p = proposal as ProposalReviewData;
    const proposalId = p.id || p.id_proposal;
    router.push(`/reviewer/proposal/${proposalId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{getProposalTitle()}</h3>
            {getReviewStatus()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-1">
          <div className="text-sm">
            <span className="font-medium">Diajukan oleh:</span>{" "}
            {getSubmitterName()}
          </div>
          <div className="text-sm">
            <span className="font-medium">Bidang:</span> {getBidang()}
          </div>
          <div className="text-sm">
            <span className="font-medium">Tanggal Pengajuan:</span>{" "}
            {formatDate(getCreatedDate())}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleReview}
          variant={((proposal as ProposalReviewData).review_status === "reviewed" || (proposal as ProposalReviewData).status_penilaian === "reviewed") ? "outline" : "default"}
        >
          {((proposal as ProposalReviewData).review_status === "reviewed" || (proposal as ProposalReviewData).status_penilaian === "reviewed") ? "Lihat Review" : "Review Proposal"}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 