"use client";

import { useTransition } from "react";
import { Menu, LogOut } from "lucide-react";
import { handleSignOut } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserInfo {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface AdminHeaderProps {
  user: UserInfo;
  onMenuClick: () => void;
}

export default function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-hairline-soft bg-canvas/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="-ml-2 flex size-8 items-center justify-center rounded-lg text-slate transition-colors hover:bg-primary-soft hover:text-primary lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-caption text-primary">
          {user?.role}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar size="sm">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="hidden text-body text-ink sm:block">{user?.name || "User"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-body font-accent text-ink">{user?.name || "User"}</p>
              <p className="text-caption text-slate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onSelect={() => startTransition(() => handleSignOut())}
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
