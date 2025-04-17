'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ProposalWithRelations } from "@/types/proposal";
import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface ProposalReviewItemProps {
  proposal: ProposalWithRelations | any; // Menggunakan any untuk mengatasi perbedaan struktur data
}

export function ProposalReviewItem({ proposal }: ProposalReviewItemProps) {
  const router = useRouter();

  // Fungsi untuk memastikan properti yang tepat digunakan
  const getProposalTitle = () => {
    return proposal.title || proposal.judul || "Judul tidak tersedia";
  };

  const getSubmitterName = () => {
    if (proposal.submitter?.name) {
      return proposal.submitter.name;
    }
    return proposal.mahasiswa?.nama || "Nama tidak tersedia";
  };

  const getBidang = () => {
    return proposal.bidang || proposal.bidang_pkm?.nama || "Bidang tidak tersedia";
  };

  const getCreatedDate = () => {
    return proposal.created_at || "Tanggal tidak tersedia";
  };

  const getReviewStatus = () => {
    const status = proposal.review_status || proposal.status_penilaian;
    if (status === "reviewed") {
      return <Badge className="ml-2 bg-green-500">Sudah direview</Badge>;
    }
    return <Badge className="ml-2 bg-yellow-500">Belum direview</Badge>;
  };

  const handleReview = () => {
    // Gunakan ID proposal yang sesuai, bergantung pada struktur data
    const proposalId = proposal.id || proposal.id_proposal;
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
          variant={(proposal.review_status === "reviewed" || proposal.status_penilaian === "reviewed") ? "outline" : "default"}
        >
          {(proposal.review_status === "reviewed" || proposal.status_penilaian === "reviewed") ? "Lihat Review" : "Review Proposal"}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 