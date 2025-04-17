// types/menu.ts
import { LucideIcon } from "lucide-react";

export type MenuItem = {
  title: string;
  icon: string;
  link: string;
};

export const adminMenu: MenuItem[] = [
  { title: "Dashboard", icon: "LayoutDashboard", link: "/admin/" },
  { title: "Kelola User", icon: "Users", link: "/admin/users" },
  { title: "Kelola Proposal", icon: "FileText", link: "/admin/proposal" },
  { title: "Kelola Kriteria Administrasi", icon: "ClipboardCheck", link: "/admin/kriteria-administrasi" },
  { title: "Kelola Kriteria Substansi", icon: "ClipboardList", link: "/admin/kriteria-substansi" },
  { title: "Laporan", icon: "BarChart", link: "/admin/reports" },
  { title: "Pengaturan", icon: "Settings", link: "/settings" },
];

export const reviewerMenu: MenuItem[] = [
  { title: "Dashboard", icon: "LayoutDashboard", link: "/reviewer/" },
  { title: "Penilaian Administrasi", icon: "ClipboardCheck", link: "/reviewer/penilaian-administrasi" },
  { title: "Penilaian Substansi", icon: "ClipboardList", link: "/reviewer/penilaian-substansi" },
  { title: "Laporan", icon: "BarChart", link: "/reviewer/reports" },
  { title: "Pengaturan", icon: "Settings", link: "/settings" }
];
