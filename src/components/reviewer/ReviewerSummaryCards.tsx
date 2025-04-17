'use client';

import { useEffect, useState } from "react";
import { StatCard } from "@/components/reviewer/StatCard";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import { useReviewerDashboard } from "@/hooks/use-reviewer-dashboard";

interface ReviewerSummaryCardsProps {
  userId: string;
}

export function ReviewerSummaryCards({ userId }: ReviewerSummaryCardsProps) {
  const { proposals, isLoading, stats } = useReviewerDashboard(userId);
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    reviewed: 0,
    unreviewed: 0
  });

  useEffect(() => {
    if (!isLoading && proposals && stats) {
      // Hitung statistik
      const reviewedCount = proposals.filter(p => 
        (p as any).isReviewed === true || 
        (p as any).review_status === 'reviewed' || 
        (p as any).status_penilaian === 'reviewed'
      ).length;
      
      const totalCount = stats.totalProposals || 0; // Total semua proposal dalam sistem
      const assignedCount = stats.assignedProposals || 0; // Jumlah proposal yang ditugaskan ke reviewer ini
      const unreviewedCount = assignedCount - reviewedCount; // Jumlah proposal yang belum dinilai oleh reviewer ini
      
      // Update state
      setReviewStats({
        total: totalCount,
        reviewed: reviewedCount,
        unreviewed: unreviewedCount > 0 ? unreviewedCount : 0 // Pastikan tidak negatif
      });
    }
  }, [isLoading, proposals, stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Proposal"
        value={reviewStats.total}
        icon={ClipboardList}
        description="Total semua proposal dalam sistem"
        loading={isLoading}
        className="border-t-4 border-t-blue-500"
      />
      
      <StatCard
        title="Sudah Dinilai"
        value={reviewStats.reviewed}
        icon={CheckCircle}
        description="Jumlah proposal yang sudah Anda nilai"
        loading={isLoading}
        className="border-t-4 border-t-green-500"
      />
      
      <StatCard
        title="Belum Dinilai"
        value={reviewStats.unreviewed}
        icon={Clock}
        description="Jumlah proposal yang belum Anda nilai"
        loading={isLoading}
        className="border-t-4 border-t-yellow-500"
      />
    </div>
  );
} 