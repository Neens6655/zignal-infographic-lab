'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sparkles, LayoutDashboard, LogOut } from 'lucide-react';

export function SiteHeader({ onAuthClick }: { onAuthClick?: () => void }) {
  const { user, isAnonymous, signOut, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-[var(--z-gold)] rounded-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            ZIGNAL<span className="text-muted-foreground">.LAB</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {!isLoading && user && !isAnonymous && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                  History
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </Button>
            </>
          )}
          {!isLoading && (isAnonymous || !user) && (
            <Button size="sm" onClick={onAuthClick}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
