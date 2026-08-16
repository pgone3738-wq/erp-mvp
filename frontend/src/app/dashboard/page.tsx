'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, AlertTriangle } from 'lucide-react'

const API_URL = 'https://erp-mvp-unc2.onrender.com'

type Item = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    itemCount: 0,
  })
  const [lowStockItems, setLowStockItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('erp_token')
        const headers = { 'Authorization': `Bearer ${token}` }

        // 1. Fetch financial summary and items at the same time
        const [summaryRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/reports/summary`, { headers }),
          fetch(`${API_URL}/items`, { headers })
        ])

        const summaryData = await summaryRes.json()
        const itemsData = await itemsRes.json()

        // 2. Set financial stats
        if (summaryData && summaryData.totalRevenue !== undefined) {
          setStats(summaryData)
        }

        // 3. Process items for Low Stock Alerts
        if (Array.isArray(itemsData)) {
          // Find items with stock less than 5
          const lowStock = itemsData.filter((item: Item) => item.stock < 5)
          setLowStockItems(lowStock)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Net Profit Card */}
        <Card className={stats.netProfit >= 0 ? 'border-green-500 border-2' : 'border-red-500 border-2'}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.totalExpenses)}</p>
          </CardContent>
        </Card>

        {/* Inventory Count Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats.itemCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit & Loss Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Total Sales Revenue</span>
                <span className="font-medium text-green-600">{formatCurrency(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Total Vendor Expenses</span>
                <span className="font-medium text-red-600">({formatCurrency(stats.totalExpenses)})</span>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span className="font-bold text-gray-900">Net Profit</span>
                <span className={`font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.netProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts Card */}
        <Card className={lowStockItems.length > 0 ? 'border-red-400 border-2' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${lowStockItems.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              <CardTitle>Low Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">All items are well stocked. (More than 5 units)</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">Item Name</th>
                      <th className="pb-2 font-medium text-right">Stock Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.stock} left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}