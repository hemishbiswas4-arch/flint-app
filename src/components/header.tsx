"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import UserDisplay from "@/components/UserDisplay";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: User | null;
  isAuthLoading: boolean;
}

const navItems = [
  { name: "Home", href: "/home" },
  { name: "Plan", href: "/plan" },
  { name: "Community", href: "/community" },
  { name: "Create", href: "/community/create" },
];

export default function Header({ user, isAuthLoading }: HeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✅ Prevent background scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  const checkActive = (href: string) => {
    if (href === "/community") {
      return pathname === "/community";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="font-bold text-2xl tracking-tight">
          Outplann
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => {
            const isActive = checkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-primary rounded-full"></span>
                )}
              </Link>
            );
          })}
          {user && (
            <Link
              href="/account"
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-primary",
                pathname === "/account"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              My Account
              {pathname === "/account" && (
                <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-primary rounded-full"></span>
              )}
            </Link>
          )}
        </nav>

        {/* Desktop User */}
        <div className="hidden md:flex items-center gap-4">
          <UserDisplay user={user} loading={isAuthLoading} />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ✅ Mobile Drawer Menu (pushes content, not overlay) */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 overflow-hidden bg-background border-b",
          isMenuOpen ? "max-h-[100vh]" : "max-h-0"
        )}
      >
        <div className="flex flex-col p-6 gap-6">
          <nav className="flex flex-col gap-4 text-lg font-semibold">
            {navItems.map((item) => {
              const isActive = checkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "block w-full py-1",
                    isActive
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
            {user && (
              <Link
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block w-full py-1",
                  pathname === "/account"
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                )}
              >
                My Account
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t">
            <UserDisplay user={user} loading={isAuthLoading} />
          </div>
        </div>
      </div>
    </header>
  );
}
