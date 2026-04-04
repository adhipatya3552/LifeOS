"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  MessageSquare,
  Plug,
  History,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const navItems = [
  { href: "/dashboard", icon: MessageSquare, label: "Dashboard" },
  { href: "/connections", icon: Plug, label: "Connections" },
  { href: "/history", icon: History, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { name } = useAppSession();

  return (
    <div
      className="flex h-dvh w-full max-w-full flex-col overflow-hidden lg:h-screen lg:flex-row"
      style={{ background: "var(--color-bg)" }}
    >
      <aside
        className="glass flex w-full shrink-0 flex-col border-b lg:w-60 lg:border-b-0 lg:border-r"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 border-b px-4 py-4 sm:px-5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary glow-primary">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">LifeOS</span>
            <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
              Personal AI Agent
            </p>
          </div>
        </div>

        {/* Navigation — compact flex column, no stretching */}
        <nav className="flex flex-col gap-0.5 px-3 py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                  style={{
                    background: isActive
                      ? "rgba(139,92,246,0.12)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(139,92,246,0.25)"
                      : "1px solid transparent",
                    color: isActive
                      ? "var(--color-primary-light)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {isActive ? (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "rgba(139,92,246,0.08)" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  ) : null}
                  <item.icon
                    className="relative z-10 h-4 w-4 shrink-0 transition-colors"
                    style={{
                      color: isActive
                        ? "var(--color-primary-light)"
                        : "var(--color-text-subtle)",
                    }}
                  />
                  <span className="relative z-10 text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User + Sign out */}
        <div
          className="space-y-1 border-t p-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p
                className="truncate text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                {name}
              </p>
            </div>
          </div>
          <a
            href="/auth/logout"
            id="logout-btn"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:opacity-80"
            style={{
              color: "var(--color-text-subtle)",
              border: "1px solid transparent",
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </a>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
