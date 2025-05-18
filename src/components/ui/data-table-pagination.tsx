import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from './button';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeChanger?: boolean;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSizeChanger = true,
}: DataTablePaginationProps) {
  // Fungsi untuk render nomor halaman
  const renderPageNumbers = () => {
    const items = [];
    
    // Selalu tampilkan halaman pertama
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => onPageChange(1)}
          isActive={currentPage === 1}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Tambahkan ellipsis jika halaman aktif lebih dari 3
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Tampilkan halaman sebelum halaman aktif jika tidak adjacen dengan halaman pertama
    if (currentPage > 2) {
      items.push(
        <PaginationItem key={currentPage - 1}>
          <PaginationLink
            onClick={() => onPageChange(currentPage - 1)}
            className="cursor-pointer"
          >
            {currentPage - 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Tampilkan halaman aktif (jika bukan halaman pertama atau terakhir)
    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(
        <PaginationItem key={currentPage}>
          <PaginationLink
            isActive
            onClick={() => onPageChange(currentPage)}
            className="cursor-pointer"
          >
            {currentPage}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Tampilkan halaman setelah halaman aktif jika tidak adjacen dengan halaman terakhir
    if (currentPage < totalPages - 1) {
      items.push(
        <PaginationItem key={currentPage + 1}>
          <PaginationLink
            onClick={() => onPageChange(currentPage + 1)}
            className="cursor-pointer"
          >
            {currentPage + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Tambahkan ellipsis jika halaman aktif kurang dari totalPages - 2
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Selalu tampilkan halaman terakhir (jika totalPages > 1)
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="text-sm text-muted-foreground">
        Menampilkan {Math.min((currentPage - 1) * pageSize + 1, totalItems)} sampai {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} entri
      </div>
      
      <div className="flex items-center gap-3">
        {showPageSizeChanger && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tampilkan</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                onPageSizeChange(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per halaman</span>
          </div>
        )}
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {renderPageNumbers()}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
} 