import {
  Store,
  Zap,
  Sparkles,
  Gift,
  Building2,
  Repeat,
  Package,
  ShoppingBag,
  Crown,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: "amber" | "rose" | "emerald" | "indigo" | "cyan";
  category: "commerce" | "innovation" | "account";
  showInTopStrip?: boolean;
}

export const STORE_NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "קטלוג מוצרים",
    shortLabel: "קטלוג",
    description: "כל מוצרי הדגל, חיפוש חכם ודירוג AI",
    icon: Store,
    category: "commerce",
    showInTopStrip: true,
  },
  {
    href: "/arena",
    label: "זירת Flash & מכרזים",
    shortLabel: "זירת Flash",
    description: "מכירות בזק, מכרזים חיים וקבוצות רכישה (-28%)",
    icon: Zap,
    badge: "LIVE",
    badgeTone: "rose",
    category: "commerce",
    showInTopStrip: true,
  },
  {
    href: "/marketplace",
    label: "מרכז סוחרים",
    shortLabel: "סוחרים",
    description: "חנויות מאומתות, פיצול תשלומים ועמלות",
    icon: Building2,
    category: "commerce",
    showInTopStrip: true,
  },
  {
    href: "/subscriptions",
    label: "מינויים וחיוב מחזורי",
    shortLabel: "מינויים",
    description: "אספקה מחזורית חכמה והנחת מנוי קבועה",
    icon: Repeat,
    category: "commerce",
    showInTopStrip: true,
  },
  {
    href: "/innovations",
    label: "חדשנות V9 (8 שירותים)",
    shortLabel: "חדשנות V9",
    description: "ליסינג, מכס $75, בונה מפרטים, לוקרים באילת ועוד",
    icon: Sparkles,
    badge: "NEW",
    badgeTone: "amber",
    category: "innovation",
    showInTopStrip: true,
  },
  {
    href: "/gifting",
    label: "מתנות, טרייד-אין ו-B2B",
    shortLabel: "מתנות וטרייד",
    description: "מתנות משותפות, שמאות מכשירים והצעות עסקיות",
    icon: Gift,
    category: "innovation",
    showInTopStrip: true,
  },
  {
    href: "/orders",
    label: "מעקב הזמנות",
    shortLabel: "הזמנות",
    description: "סטטוס שילוח DHL, קבלות דיגיטליות והחזרות",
    icon: Package,
    category: "account",
    showInTopStrip: true,
  },
  {
    href: "/cart",
    label: "עגלת קניות וקופה",
    shortLabel: "עגלה",
    description: "קופה מאוחדת: BNPL 0%, טרייד-אין וקופונים",
    icon: ShoppingBag,
    category: "account",
    showInTopStrip: false,
  },
  {
    href: "/profile",
    label: "מועדון VIP ואחריות",
    shortLabel: "VIP ואחריות",
    description: "נקודות Cashback, תעודות SHA-256 ואזור אישי",
    icon: Crown,
    badge: "VIP",
    badgeTone: "emerald",
    category: "account",
    showInTopStrip: true,
  },
  {
    href: "/admin",
    label: "בקרה SAGA וטלמטריה",
    shortLabel: "בקרה SAGA",
    description: "דשבורד 33 שירותים, Fraud Guard ואנליטיקת AI",
    icon: ShieldCheck,
    category: "account",
    showInTopStrip: true,
  },
];

export const NAV_CATEGORY_GROUPS: Array<{
  id: NavItem["category"];
  title: string;
  subtitle: string;
}> = [
  {
    id: "commerce",
    title: "חנות, זירות ומנויים",
    subtitle: "קנייה חכמה בזמן אמת",
  },
  {
    id: "innovation",
    title: "פיננסים וחדשנות V9",
    subtitle: "8 מיקרו-שירותים אוטונומיים",
  },
  {
    id: "account",
    title: "אישי, הזמנות ובקרה",
    subtitle: "ניהול חשבון, אחריות ו-SAGA",
  },
];
