import { headers } from 'next/headers';
import { PenilaianSubstansiContent } from '@/components/penilaian-substansi/PenilaianSubstansiContent';
import { redirect } from 'next/navigation';

export default async function PenilaianSubstansiPage() {
  const headersList = await headers();
  const userId = headersList.get('pkm-user-id');

  if (!userId) {
    redirect('/auth/login');
  }

  return <PenilaianSubstansiContent userId={userId} />;
}
