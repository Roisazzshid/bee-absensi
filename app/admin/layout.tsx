import { AdminGuard } from "@/components/auth/auth-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
