"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function linkClasses(isActive: boolean) {
  return [
    "font-mono text-sm tracking-tight",
    "px-3 py-2 rounded-md",
    isActive ? "bg-foreground text-background" : "hover:bg-accent-thin",
  ].join(" ")
}

export function SiteNav() {
  const pathname = usePathname()
  const isHome = pathname === "/" || pathname === ""
  const isMySkills = pathname?.startsWith("/my-skills") ?? false
  const isMarketplace = pathname?.startsWith("/marketplace") ?? false
  const isTransactions = pathname?.startsWith("/transactions") ?? false

  return (
    <nav className="flex items-center gap-2">
      <Link href="/" className={linkClasses(isHome)} aria-current={isHome ? "page" : undefined}>
        Home
      </Link>
      <Link
        href="/my-skills"
        className={linkClasses(isMySkills)}
        aria-current={isMySkills ? "page" : undefined}
      >
        My skills
      </Link>
      <Link
        href="/marketplace"
        className={linkClasses(isMarketplace)}
        aria-current={isMarketplace ? "page" : undefined}
      >
        Store
      </Link>
      <Link
        href="/transactions"
        className={linkClasses(isTransactions)}
        aria-current={isTransactions ? "page" : undefined}
      >
        Transactions
      </Link>
    </nav>
  )
}

