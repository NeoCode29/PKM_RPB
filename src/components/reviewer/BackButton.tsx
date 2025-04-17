'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();
  
  const handleBack = () => {
    router.push(href);
  };
  
  return (
    <Button variant="outline" onClick={handleBack}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Kembali
    </Button>
  );
} 