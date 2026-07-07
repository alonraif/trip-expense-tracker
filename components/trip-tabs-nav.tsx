'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { segment: 'expenses', label: 'Expenses' },
  { segment: 'members', label: 'Members' },
  { segment: 'balances', label: 'Balances' },
];

export function TripTabsNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-full items-center gap-1 rounded-lg bg-muted p-[3px]">
      {TABS.map((tab) => {
        const href = `/trips/${tripId}/${tab.segment}`;
        const isActive = pathname === href;
        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              'flex-1 rounded-md px-3 py-1 text-center text-sm font-medium transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
