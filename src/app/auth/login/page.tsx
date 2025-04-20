// app/login/page.tsx
import { Suspense } from 'react'
import LoginForm from './LoginForm'


export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string; message?: string }> }) {
  const searchParamsStore = await searchParams;
  const redirectTo = searchParamsStore?.redirectTo?.toString() || '/'
  const message = searchParamsStore?.message?.toString() || null

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm redirectTo={redirectTo} message={message} />
    </Suspense>
  )
}