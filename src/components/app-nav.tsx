"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Запись" },
  { href: "/logs", label: "Логи" },
  { href: "/reports", label: "Отчёты" },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 -mx-3 border-b border-border/80 backdrop-blur sm:-mx-4"
      aria-label="Разделы приложения"
    >
      <div className="flex gap-0 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ href, label }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname === ""
              : pathname === href || pathname?.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "min-h-11 shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
