import {
  Activity,
  Bell,
  Bitcoin,
  BookOpen,
  Briefcase,
  Coins,
  Crosshair,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Map,
  Banknote,
  Landmark,
  Layers,
  Percent,
  Sparkles,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export type NavKey = keyof Dictionary['nav'];
export type NavGroupKey = keyof Dictionary['navGroups'];

export type NavLink = {
  href: string;
  key: NavKey;
  icon: LucideIcon;
  color: string;
  /** Misafir menüsünde gizle — URL hâlâ açık (SEO / paylaşım) */
  signedInOnly?: boolean;
};

export type NavGroup = {
  group: NavGroupKey;
  items: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    group: 'terminal',
    items: [
      { href: '/terminal', key: 'overview', icon: LayoutDashboard, color: 'text-emerald-400' },
      { href: '/firsatlar', key: 'opportunities', icon: Zap, color: 'text-emerald-400' },
    ],
  },
  {
    group: 'markets',
    items: [
      { href: '/bist', key: 'bist', icon: LineChart, color: 'text-blue-400' },
      { href: '/bist/heatmap', key: 'heatmap', icon: Map, color: 'text-amber-400' },
      { href: '/us', key: 'us', icon: Landmark, color: 'text-sky-300', signedInOnly: true },
      { href: '/fon', key: 'funds', icon: Layers, color: 'text-amber-300', signedInOnly: true },
      { href: '/crypto', key: 'crypto', icon: Bitcoin, color: 'text-violet-400', signedInOnly: true },
      { href: '/fx/USD-TRY', key: 'fx', icon: Banknote, color: 'text-lime-400', signedInOnly: true },
      { href: '/faiz', key: 'rates', icon: Percent, color: 'text-teal-300' },
    ],
  },
  {
    group: 'analysis',
    items: [
      { href: '/compare', key: 'compare', icon: GitCompare, color: 'text-emerald-300', signedInOnly: true },
      { href: '/signals', key: 'signals', icon: Sparkles, color: 'text-emerald-300' },
      { href: '/targets', key: 'targets', icon: Crosshair, color: 'text-amber-300', signedInOnly: true },
      { href: '/whales', key: 'smartMoney', icon: Waves, color: 'text-cyan-400', signedInOnly: true },
      { href: '/dividends', key: 'dividends', icon: Coins, color: 'text-rose-400', signedInOnly: true },
    ],
  },
  {
    group: 'learn',
    items: [
      { href: '/egitim', key: 'academy', icon: GraduationCap, color: 'text-sky-400' },
      { href: '/blog', key: 'blog', icon: BookOpen, color: 'text-zinc-300' },
    ],
  },
  {
    group: 'account',
    items: [
      { href: '/portfolio-audit', key: 'portfolioAudit', icon: Activity, color: 'text-rose-300', signedInOnly: true },
      { href: '/portfolio', key: 'portfolio', icon: Briefcase, color: 'text-cyan-400' },
      { href: '/alerts', key: 'alerts', icon: Bell, color: 'text-orange-400' },
    ],
  },
];

/** Primary destinations for mobile bottom bar */
export const MOBILE_BOTTOM_ITEMS: NavLink[] = [
  { href: '/terminal', key: 'overview', icon: LayoutDashboard, color: 'text-emerald-400' },
  { href: '/firsatlar', key: 'opportunities', icon: Zap, color: 'text-emerald-400' },
  { href: '/bist', key: 'bist', icon: LineChart, color: 'text-blue-400' },
  { href: '/portfolio', key: 'portfolio', icon: Briefcase, color: 'text-cyan-400' },
];

export function isNavActive(pathname: string, href: string) {
  if (href === '/terminal') {
    return pathname === '/terminal' || pathname === '/dashboard';
  }
  if (href === '/bist') {
    return pathname === '/bist' || /^\/bist\/(?!heatmap)/.test(pathname);
  }
  if (href === '/crypto') {
    return pathname === '/crypto' || pathname.startsWith('/crypto/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function allNavHrefs() {
  return NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
}

export function navGroupsForUser(signedIn: boolean): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => signedIn || !i.signedInOnly),
  })).filter((g) => g.items.length > 0);
}
