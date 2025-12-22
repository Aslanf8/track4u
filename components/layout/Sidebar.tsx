"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/history",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    label: "Progress",
    href: "/progress",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 shrink-0"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasMountedRef = useRef(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Only run once on mount
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const shouldCollapse = stored === "true";

    // Use requestAnimationFrame to batch with React's update cycle
    requestAnimationFrame(() => {
      if (shouldCollapse) setIsCollapsed(true);
      setHasMounted(true);
    });
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
  };

  return { isCollapsed, hasMounted, toggleCollapsed };
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, hasMounted, toggleCollapsed } = useSidebarState();

  return (
    <>
      {/* Fixed Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-16 bottom-0 flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-30 ease-in-out",
          hasMounted ? "transition-all duration-300" : "transition-none",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 dark:shadow-amber-500/15"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    "transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap transition-all duration-300",
                    isCollapsed
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100 w-auto"
                  )}
                >
                  {item.label}
                </span>
                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full hidden" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <button
            onClick={toggleCollapsed}
            className={cn(
              "flex items-center w-full rounded-xl py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all duration-200",
              isCollapsed ? "justify-center px-0" : "gap-3 px-4"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "w-5 h-5 shrink-0 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )}
            >
              <path d="m11 17-5-5 5-5" />
              <path d="m18 17-5-5 5-5" />
            </svg>
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap transition-all duration-300",
                isCollapsed
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100 w-auto"
              )}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* Spacer to prevent content from going under the fixed sidebar */}
      <div
        className={cn(
          "hidden md:block shrink-0 ease-in-out",
          hasMounted ? "transition-all duration-300" : "transition-none",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      />
    </>
  );
}
