// types/menu.ts
import { LucideIcon, LayoutDashboard, Users, FileText, Settings, File, BarChart, LogOut } from "lucide-react";

export type MenuItem = {
  title: string;
  icon: LucideIcon;
  link: string;
};

export const adminMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, link: "/admin/" },
  { title: "Kelola User", icon: Users, link: "/admin/users" },
  { title: "Kelola Proposal", icon: FileText, link: "/admin/proposal" },
  { title: "Kelola Kriteria Administrasi", icon: Settings, link: "/admin/kriteria-administrasi" },
  { title: "Kelola Kriteria Substansi", icon: File, link: "/admin/kriteria-substansi" },
  { title: "Laporan", icon: BarChart, link: "/admin/reports" },
  { title: "Pengaturan", icon: Settings, link: "/settings" },
  { title: "Logout", icon: LogOut, link: "/auth/logout" },
];

export const reviewerMenu: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, link: "/reviewer/" },
  { title: "Penilaian Administrasi", icon: FileText, link: "/reviewer/penilaian-administrasi" },
  { title: "Penilaian Substansi", icon: File, link: "/reviewer/penilaian-substansi" },
  { title: "Laporan", icon: BarChart, link: "/reviewer/reports" },
  { title: "Pengaturan", icon: Settings, link: "/settings" },
  { title: "Logout", icon: LogOut, link: "/auth/logout" },
];
