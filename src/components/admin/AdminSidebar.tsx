"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Handshake,
  Trophy,
  IndianRupee,
  SlidersHorizontal,
} from "lucide-react";
import { handleSignOut } from "@/actions/auth";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface UserInfo {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface AdminSidebarProps {
  user: UserInfo;
  open: boolean;
  onClose: () => void;
}

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/connectors", label: "Connectors", icon: Handshake, roles: ["MANAGER", "SUPER_ADMIN"] },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: UserCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const connectorSubLinks = [
  { href: "/admin/connectors/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/connectors/payouts", label: "Payouts", icon: IndianRupee },
  { href: "/admin/connectors/commission-rules", label: "Commission Rules", icon: SlidersHorizontal },
];

function SidebarContent({ user, onNavClick }: { user: UserInfo; onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline-soft px-5">
        <Image src="/images/icons/logo.png" alt="Growarth Capita" width={260} height={72} className="h-16 w-auto" />
        <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-caption text-primary">
          CRM
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {links
          .filter((l) => !l.roles || l.roles.includes(user.role || ""))
          .map((link) => {
          const isActive =
            link.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body transition-colors",
                isActive
                  ? "bg-primary-soft text-primary font-accent"
                  : "text-slate hover:bg-primary-soft hover:text-primary",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}

        {["MANAGER", "SUPER_ADMIN"].includes(user.role || "") && (
          <div className="pt-0.5">
            {connectorSubLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg pl-10 pr-3 py-2 text-body transition-colors",
                    isActive
                      ? "bg-primary-soft/60 text-primary font-accent"
                      : "text-slate hover:bg-primary-soft/60 hover:text-primary",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="text-caption">{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-hairline-soft">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-body font-accent text-primary">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-accent text-ink">{user?.name || "User"}</p>
            <p className="truncate text-caption text-steel">{user?.role}</p>
          </div>
        </div>
        <form action={handleSignOut} className="px-3 pb-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-body text-slate transition-colors hover:bg-critical/10 hover:text-critical"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  );
}

export default function AdminSidebar({ user, open, onClose }: AdminSidebarProps) {
  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-hairline-soft bg-canvas lg:flex lg:flex-col">
        <SidebarContent user={user} />
      </aside>

      <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent side="left" showCloseButton={false} className="flex w-72 flex-col bg-canvas p-0">
          <SidebarContent user={user} onNavClick={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
