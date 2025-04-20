'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { loginUser } from './actions'
import { AlertCircle, Info } from 'lucide-react'

// Skema validasi client-side
const formSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password harus minimal 6 karakter' }),
})

interface LoginFormProps {
  redirectTo: string;
  message: string | null;
}

export default function LoginForm({ redirectTo, message }: LoginFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [needsConfirmation, setNeedsConfirmation] = useState(false)
    const [emailAddress, setEmailAddress] = useState<string>('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setEmailAddress(data.email);
    startTransition(async () => {
      try {
        const result = await loginUser(data)
        setError(null);
        
        if (result.success) {
          router.push(result.nextLink || redirectTo);
        } else {
          setError(result.error || 'Terjadi kesalahan saat login')
          setNeedsConfirmation(result.needsEmailConfirmation || false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login')
      }
    })
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Masuk ke Akun Anda</CardTitle>
          <CardDescription>
            Silakan masukkan email dan password Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
            {error && (
                <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {message && (
                <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}
            {needsConfirmation && (
                <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Verifikasi Email</AlertTitle>
                <AlertDescription>
                  Email konfirmasi telah dikirim ke {emailAddress}. 
                  Silakan periksa kotak masuk Anda dan klik tautan verifikasi sebelum login.
                </AlertDescription>
                </Alert>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="email@contoh.com"
                            {...field}
                            disabled={isPending}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input
                            type="password"
                            placeholder="•••••••"
                            {...field}
                            disabled={isPending}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Memproses...' : 'Masuk'}
                </Button>
                </form>
            </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Daftar di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 