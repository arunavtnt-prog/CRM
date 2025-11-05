'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    title: 'Creators',
    href: '/creators',
    icon: '👥',
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: '📢',
  },
  {
    title: 'Deals',
    href: '/deals',
    icon: '💼',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: '⚙️',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
