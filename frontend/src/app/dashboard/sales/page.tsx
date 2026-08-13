'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type Invoice = {
  id: string
  customerName: string
  itemName: string
  quantity: number
  totalAmount: number
  createdAt: string
}

export default function SalesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customerName, setCustomerName] = useState('')
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [totalAmount, setTotalAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

    const fetchInvoices = async () => {
    const token = localStorage.getItem('erp_token') // Get the token
    const res = await fetch('http://localhost:3000/invoices', {
      headers: {
        'Authorization': `Bearer ${token}` // Send the token
      }
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      setInvoices(data)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

        try {
      const token = localStorage.getItem('erp_token') // Get the token
      const res = await fetch('http://localhost:3000/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send the token
        },
        body: JSON.stringify({
          customerName,
          itemName,
          quantity: parseInt(quantity),
          totalAmount: parseFloat(totalAmount)
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage(`Success! Invoice created for ${data.customerName}.`)
        // Clear form
        setCustomerName('')
        setItemName('')
        setQuantity('1')
        setTotalAmount('')
        // Refresh invoice list
        fetchInvoices()
      } else {
        setMessage(`Error: ${data.message}`)
      }
    } catch (error) {
      setMessage('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales & Invoicing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Invoice Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name (Must match inventory)</Label>
                <Input id="itemName" placeholder="e.g. Laptop" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total ($)</Label>
                  <Input id="totalAmount" type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
              {message && <p className="text-sm text-center text-gray-600">{message}</p>}
            </form>
          </CardContent>
        </Card>

        {/* Invoices List Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-right">Qty</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
                        No invoices yet.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{invoice.customerName}</td>
                        <td className="py-3 text-gray-600">{invoice.itemName}</td>
                        <td className="py-3 text-right text-gray-600">{invoice.quantity}</td>
                        <td className="py-3 text-right font-medium text-green-600">${invoice.totalAmount.toFixed(2)}</td>
                        <td className="py-3 text-gray-500 text-xs">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}