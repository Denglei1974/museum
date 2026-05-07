"use client";

import Link from "next/link";

interface VolunteerNavProps {
  theme: { primary: string; bg: string; accent: string };
  active?: "home" | "checkin" | "profile";
}

export default function VolunteerNav({ theme, active }: VolunteerNavProps) {
  const items = [
    {
      label: "首页",
      href: "/dashboard",
      key: "home" as const,
      icon: (isActive: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive ? theme.primary : "none"} stroke={isActive ? theme.primary : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "签到",
      href: "/checkin",
      key: "checkin" as const,
      icon: (isActive: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={isActive ? theme.primary : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      label: "个人中心",
      href: "/profile",
      key: "profile" as const,
      icon: (isActive: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isActive ? theme.primary : "none"} stroke={isActive ? theme.primary : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{ maxWidth: "32rem", margin: "0 auto" }}
    >
      <div className="flex justify-around items-center py-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex flex-col items-center px-6 py-2 transition-colors"
            style={active === item.key ? { color: theme.primary } : { color: "#9CA3AF" }}
          >
            {item.icon(active === item.key)}
            <span className="text-xs mt-1" style={{ fontWeight: active === item.key ? 600 : 400 }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
