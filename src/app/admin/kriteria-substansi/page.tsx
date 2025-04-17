import { Metadata } from 'next';
import { KriteriaSubstansiManagement } from '@/components/kriteria-substansi/KriteriaSubstansiManagement';

export const metadata: Metadata = {
  title: 'Kriteria Substansi | PKM RPB',
  description: 'Manajemen kriteria substansi proposal PKM',
};

export default function KriteriaSubstansiPage() {
  return <KriteriaSubstansiManagement />;
} 