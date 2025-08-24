'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import { UserDisplay } from '@/app/components/AuthButtons';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  user: User | null;
  isAuthLoading: boolean;
}

const NavLink = ({ href, currentPath, children }: { href: string; currentPath: string; children: React.ReactNode }) => {
  const isActive = currentPath.startsWith(href);
  return (
    <Link href={href} className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-primary-foreground bg-primary' : 'text-muted-foreground hover:text-primary'}`}>
      {children}
    </Link>
  );
};

export default function Header({ user, isAuthLoading }: HeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl tracking-tighter">
          Outplann
        </Link>
        
        {/* Desktop Navigation (Pill Style) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <div className="bg-secondary p-1 rounded-full flex items-center">
            <NavLink href="/plan" currentPath={pathname}>Plan</NavLink>
            <NavLink href="/community" currentPath={pathname}>Community</NavLink>
          </div>
        </div>
        
        {/* Desktop Sign In */}
        <nav className="hidden md:flex items-center gap-4">
          {!isAuthLoading && <UserDisplay user={user} />}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b animate-in fade-in-20">
          <div className="container py-4 flex flex-col space-y-4">
            <Link href="/plan" className="font-semibold" onClick={() => setIsMenuOpen(false)}>Plan</Link>
            <Link href="/community" className="font-semibold" onClick={() => setIsMenuOpen(false)}>Community</Link>
            <div className="pt-4 border-t">
              {!isAuthLoading && <UserDisplay user={user} />}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}