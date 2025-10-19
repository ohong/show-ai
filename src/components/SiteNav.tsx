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
    </nav>
  )
}


