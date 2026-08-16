'use client'

import { Button } from '@/components/ui/button'
import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation' // <-- Added usePathname
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react' // <-- Added for spinner

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
  const pathname = usePathname() // <-- Get current path
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <div className="text-2xl font-bold mb-8 text-center border-b border-gray-700 pb-4">
          ERP MVP
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            // Check if the current path matches the link
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            
            return (
              <Link href={link.href} key={link.name}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full justify-start ${isActive ? 'bg-gray-800 text-white font-bold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  {link.name}
                </Button>
              </Link>
            )
          })}
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

      {/* Toaster Component */}
      <Toaster richColors position="bottom-right" />
    </div>
  )
}