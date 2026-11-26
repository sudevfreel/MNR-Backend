'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardNavLink() {
  const pathname = usePathname()
  const isActive = pathname === '/dashboard'

  return (
    <Link href="/dashboard" className={`nav__link ${isActive ? 'nav__link--active' : ''}`}>
      <span>Dashboard</span>
    </Link>
  )
}
