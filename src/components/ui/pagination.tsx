import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  showPageSizeSelector = true,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Fungsi untuk menghasilkan tombol halaman
  const generatePageButtons = () => {
    const pages = [];
    const maxButtons = 5; // Jumlah maksimum tombol halaman yang ditampilkan
    
    // Jika total halaman <= maxButtons, tampilkan semua halaman
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            className="h-8 w-8 p-0"
          >
            {i}
          </Button>
        );
      }
    } else {
      // Tampilkan halaman pertama
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
        >
          1
        </Button>
      );
      
      // Tentukan range halaman yang ditampilkan
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, startPage + 2);
      
      // Jika di dekat halaman awal
      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      }
      
      // Jika di dekat halaman akhir
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }
      
      // Tambahkan ellipsis jika perlu
      if (startPage > 2) {
        pages.push(
          <Button
            key="ellipsis1"
            variant="outline"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
          >
            ...
          </Button>
        );
      }
      
      // Tambahkan halaman di tengah
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(i)}
            className="h-8 w-8 p-0"
          >
            {i}
          </Button>
        );
      }
      
      // Tambahkan ellipsis jika perlu
      if (endPage < totalPages - 1) {
        pages.push(
          <Button
            key="ellipsis2"
            variant="outline"
            size="sm"
            disabled
            className="h-8 w-8 p-0"
          >
            ...
          </Button>
        );
      }
      
      // Tambahkan halaman terakhir
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
        >
          {totalPages}
        </Button>
      );
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 py-4">
      <div className="text-sm text-muted-foreground">
        Menampilkan <span className="font-medium">{startItem}</span> sampai{" "}
        <span className="font-medium">{endItem}</span> dari{" "}
        <span className="font-medium">{totalItems}</span> data
      </div>

      <div className="flex items-center space-x-6">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          <div className="flex items-center space-x-1">
            {generatePageButtons()}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 