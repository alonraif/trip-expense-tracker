'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/components/i18n-provider';
import type { Dictionary } from '@/lib/i18n';

function getTabs(dict: Dictionary) {
  return [
    { segment: 'expenses', label: dict.tabs.expenses },
    { segment: 'members', label: dict.tabs.members },
    { segment: 'balances', label: dict.tabs.balances },
  ];
}

export function TripTabsNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const dict = useTranslations();
  const tabs = getTabs(dict);

  return (
    <nav className="flex w-full items-center gap-1 rounded-lg bg-muted p-[3px]">
      {tabs.map((tab) => {
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
