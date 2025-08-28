//src/components/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import UserDisplay from "@/components/UserDisplay";
import { Home, Users, Map, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: User | null;
  isAuthLoading: boolean;
}

export default function Header({ user, isAuthLoading }: HeaderProps) {
  const pathname = usePathname();

  const checkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/community") {
      return (
        pathname === "/community" ||
        pathname.startsWith("/community/feed") ||
        pathname.startsWith("/community/posts")
      );
    }
    if (href === "/community/plan") {
      return pathname.startsWith("/community/plan");
    }
    if (href === "/community/user") {
      return pathname.startsWith("/community/user");
    }
    return false;
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Community", href: "/community", icon: Users },
    { name: "Plan", href: "/community/plan", icon: Map },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
        <div className="container h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl tracking-tight">
            Outplann
          </Link>

          {/* Desktop Nav */}
          <nav className="flex gap-6">
            {navItems.map((item) => {
              const isActive = checkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon size={16} />
                  {item.name}
                  {isActive && (
                    <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-primary rounded-full"></span>
                  )}
                </Link>
              );
            })}
            {user && (
              <Link
                href={`/community/user/${user.uid}`}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                  checkActive("/community/user")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <UserIcon size={16} />
                My Profile
                {checkActive("/community/user") && (
                  <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-primary rounded-full"></span>
                )}
              </Link>
            )}
          </nav>

          {/* Desktop User */}
          <div className="flex items-center gap-4">
            <UserDisplay user={user} loading={isAuthLoading} />
          </div>
        </div>
      </header>

      {/* Mobile Footer Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-around md:hidden py-2">
        {navItems.map((item) => {
          const isActive = checkActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} />
              {item.name}
            </Link>
          );
        })}
        {user && (
          <Link
            href={`/community/user/${user.uid}`}
            className={cn(
              "flex flex-col items-center text-xs font-medium transition-colors",
              checkActive("/community/user")
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <UserIcon size={22} />
            Profile
          </Link>
        )}
      </nav>
    </>
  );
}
