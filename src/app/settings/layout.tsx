import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
  description: "Kelola pengaturan dan preferensi akun Anda",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
      <Toaster />
    </div>
  );
} 