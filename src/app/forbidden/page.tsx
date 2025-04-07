import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ForbiddenPage() {
  const header = await headers();
  const userRole = header.get("pkm-user-role");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Alert className="max-w-md p-6 bg-white rounded-lg shadow-md">
        <AlertTitle className="text-2xl font-bold text-red-600">
          403 Forbidden
        </AlertTitle>
        <AlertDescription className="mt-4 text-gray-600">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </AlertDescription>
        <div className="mt-6">
          <a href={userRole === "admin" ? "/admin" : "/reviewer"}>
            <Button>
              Kembali ke Beranda 
            </Button>
          </a>
        </div>
      </Alert>
    </div>
  );
}
