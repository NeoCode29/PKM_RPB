export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  bidang: string;
  created_at: string;
  updated_at: string;
  status: string;
  review_status: string;
  submitter_id: string;
}

export interface ProposalWithRelations extends Proposal {
  submitter?: User;
  reviewers?: User[];
  review_result?: any;
}

export interface ProposalFilter {
  page: number;
  pageSize: number;
  search?: string;
  bidang?: string;
  status?: string;
  reviewStatus?: string;
}

export interface PaginatedProposals {
  data: ProposalWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 