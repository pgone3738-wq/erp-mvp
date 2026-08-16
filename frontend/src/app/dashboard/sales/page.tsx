'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const API_URL = 'https://erp-mvp-unc2.onrender.com'

type Invoice = {
  id: string
  customerName: string
  itemName: string
  quantity: number
  totalAmount: number
  createdAt: string
}

type Item = {
  id: string
  name: string
  price: number
  stock: number
}

type Contact = {
  id: string
  name: string
  type: string
}

export default function SalesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [customers, setCustomers] = useState<Contact[]>([])
  
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [totalAmount, setTotalAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInvoices()
    fetchItems()
    fetchCustomers()
  }, [])

  const fetchInvoices = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/invoices`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) setInvoices(data)
  }

  const fetchItems = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) setItems(data)
  }

  const fetchCustomers = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    // Filter to only show CUSTOMERS
    if (Array.isArray(data)) {
      setCustomers(data.filter(c => c.type === 'CUSTOMER'))
    }
  }

  const handleItemChange = (name: string) => {
    setSelectedItem(name)
    const item = items.find(i => i.name === name)
    if (item) {
      const qty = parseInt(quantity) || 1
      setTotalAmount((item.price * qty).toFixed(2))
    }
  }

  const handleQtyChange = (qty: string) => {
    setQuantity(qty)
    const item = items.find(i => i.name === selectedItem)
    if (item) {
      setTotalAmount((item.price * (parseInt(qty) || 1)).toFixed(2))
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: selectedCustomer, // Use dropdown value
          itemName: selectedItem,
          quantity: parseInt(quantity),
          totalAmount: parseFloat(totalAmount)
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Invoice Created!', {
          description: `Sold ${data.quantity}x ${data.itemName} to ${data.customerName}.`,
        })
        setSelectedCustomer('')
        setSelectedItem('')
        setQuantity('1')
        setTotalAmount('')
        fetchInvoices()
      } else {
        toast.error('Failed to create invoice', { description: data.message })
      }
    } catch (error) {
      toast.error('Connection Error', { description: 'Is Render awake?' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales & Invoicing</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              
              {/* CUSTOMER DROPDOWN */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Select Customer</Label>
                <select 
                  id="customerName" 
                  value={selectedCustomer} 
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-gray-900"
                  required
                >
                  <option value="">-- Choose a Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName">Select Item</Label>
                <select 
                  id="itemName" 
                  value={selectedItem} 
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-gray-900"
                  required
                >
                  <option value="">-- Choose an Item --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} (Stock: {item.stock}) - ${item.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => handleQtyChange(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total ($)</Label>
                  <Input id="totalAmount" type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </form>
          </CardContent>
        </Card>

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
                      <td colSpan={5} className="py-4 text-center text-gray-400">No invoices yet.</td>
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