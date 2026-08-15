'use client'

import { Button } from '@/components/ui/button'
import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner' // <-- ADDED THIS

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Inventory', href: '/dashboard/inventory' },
  { name: 'Sales', href: '/dashboard/sales' },
  { name: 'Purchases', href: '/dashboard/purchases' },
  { name: 'Contacts', href: '/dashboard/contacts' },
  { name: 'Accounting', href: '/dashboard/accounting' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('erp_token')
    if (!token) {
      router.push('/')
    } else {
      setIsAuthorized(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    router.push('/')
  }

  if (!isAuthorized) {
    return null 
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <div className="text-2xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
          ERP MVP
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.name}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white">
                {link.name}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>

      {/* Toaster Component (This makes the popups appear) */}
      <Toaster richColors position="bottom-right" />
    </div>
  )
}