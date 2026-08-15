'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const API_URL = 'https://erp-mvp-unc2.onrender.com'

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    itemCount: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('erp_token')
        
        // Fetch the summary from the backend report route
        const res = await fetch(`${API_URL}/reports/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await res.json()
        if (data && data.totalRevenue !== undefined) {
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      }
    }

    fetchDashboardData()
  }, [])

  // Helper function to format numbers as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

      {/* Simple P&L Summary Text */}
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
    </div>
  )
}