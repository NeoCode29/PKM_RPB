import { headers } from 'next/headers';

export async function getUserId(): Promise<string> {
  try {
    const headersList = await headers();
    const userId = headersList.get('pkm-user-id');
    
    if (!userId) {
      throw new Error('User ID tidak ditemukan di header');
    }
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID from headers:', error);
    throw new Error('Gagal mendapatkan ID pengguna');
  }
} 