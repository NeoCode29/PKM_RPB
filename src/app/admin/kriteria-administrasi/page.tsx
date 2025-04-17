import { Metadata } from 'next';
import { KriteriaAdministrasiManagement } from '@/components/kriteria-administrasi/KriteriaAdministrasiManagement';

export const metadata: Metadata = {
  title: 'Kriteria Administrasi | PKM RPB',
  description: 'Manajemen kriteria administrasi proposal PKM',
};

export default function KriteriaAdministrasiPage() {
  return <KriteriaAdministrasiManagement />;
}
