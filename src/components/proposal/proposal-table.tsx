"use client"

import { useState } from "react";
import { 
  ProposalWithRelations 
} from "@/services/proposal-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Download, 
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProposalTableProps {
  data: ProposalWithRelations[];
  onEdit: (item: ProposalWithRelations) => void;
  onDelete: (item: ProposalWithRelations) => void;
  onView: (item: ProposalWithRelations) => void;
  onExport?: () => void;
  isLoading?: boolean;
  totalCount?: number;
}

// Status mapping untuk badge
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  'Belum Dinilai': 'secondary',
  'Sedang Ditinjau': 'warning',
  'Diterima': 'success',
  'Ditolak': 'destructive'
};

// Icon mapping untuk status
const StatusIcon = ({status}: {status: string | null}) => {
  if (!status) return null;
  
  switch(status) {
    case 'Belum Dinilai':
      return <Clock className="mr-2 h-4 w-4" />;
    case 'Sedang Ditinjau':
      return <Eye className="mr-2 h-4 w-4" />;
    case 'Diterima':
      return <CheckCircle className="mr-2 h-4 w-4" />;
    case 'Ditolak':
      return <XCircle className="mr-2 h-4 w-4" />;
    default:
      return null;
  }
};

export function ProposalTable({ 
  data, 
  onEdit, 
  onDelete, 
  onView, 
  onExport,
  isLoading = false,
  totalCount
}: ProposalTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Bidang PKM</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Tidak ada data proposal
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow 
                key={item.id_proposal}
                onMouseEnter={() => setHoveredRow(item.id_proposal)}
                onMouseLeave={() => setHoveredRow(null)}
                className="cursor-pointer"
                onClick={() => onView(item)}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium line-clamp-2 max-w-[300px]">
                  {item.judul}
                </TableCell>
                <TableCell>{item.bidang_pkm?.nama || '-'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(item);
                            }}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Lihat</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lihat detail</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit proposal</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus proposal</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 