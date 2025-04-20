import { Suspense } from 'react';
import VerifyEmailForm from './VerifyEmailForm';


export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const searchParamsStore = await searchParams;
  const email = searchParamsStore?.email?.toString() || 'your email';

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm email={email} />
    </Suspense>
  );
}
