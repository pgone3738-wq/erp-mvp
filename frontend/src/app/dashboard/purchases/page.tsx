'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const API_URL = 'https://erp-mvp-unc2.onrender.com'

type Bill = {
  id: string
  vendorName: string
  itemName: string
  quantity: number
  totalCost: number
  createdAt: string
}

type Item = {
  id: string
  name: string
}

type Contact = {
  id: string
  name: string
  type: string
}

export default function PurchasesPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [vendors, setVendors] = useState<Contact[]>([])
  
  const [selectedVendor, setSelectedVendor] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [totalCost, setTotalCost] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBills()
    fetchItems()
    fetchVendors()
  }, [])

  const fetchBills = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/bills`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) setBills(data)
  }

  const fetchItems = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) setItems(data)
  }

  const fetchVendors = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    // Filter to only show VENDORS
    if (Array.isArray(data)) {
      setVendors(data.filter(c => c.type === 'VENDOR'))
    }
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorName: selectedVendor, // Use dropdown value
          itemName: selectedItem,
          quantity: parseInt(quantity),
          totalCost: parseFloat(totalCost)
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Stock Received!', {
          description: `Added ${data.quantity}x ${data.itemName} to inventory.`,
        })
        setSelectedVendor('')
        setSelectedItem('')
        setQuantity('1')
        setTotalCost('')
        fetchBills()
      } else {
        toast.error('Failed to record bill', { description: data.message })
      }
    } catch (error) {
      toast.error('Connection Error', { description: 'Is Render awake?' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Purchases & Vendors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Record Vendor Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBill} className="space-y-4">
              
              {/* VENDOR DROPDOWN */}
              <div className="space-y-2">
                <Label htmlFor="vendorName">Select Vendor</Label>
                <select 
                  id="vendorName" 
                  value={selectedVendor} 
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-gray-900"
                  required
                >
                  <option value="">-- Choose a Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName">Select Item</Label>
                <select 
                  id="itemName" 
                  value={selectedItem} 
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-gray-900"
                  required
                >
                  <option value="">-- Choose an Item --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Received</Label>
                  <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCost">Total Cost ($)</Label>
                  <Input id="totalCost" type="number" step="0.01" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Receive Stock'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Vendor</th>
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-right">Qty</th>
                    <th className="pb-2 font-medium text-right">Cost</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">No bills recorded yet.</td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{bill.vendorName}</td>
                        <td className="py-3 text-gray-600">{bill.itemName}</td>
                        <td className="py-3 text-right text-gray-600">{bill.quantity}</td>
                        <td className="py-3 text-right font-medium text-red-600">${bill.totalCost.toFixed(2)}</td>
                        <td className="py-3 text-gray-500 text-xs">
                          {new Date(bill.createdAt).toLocaleDateString()}
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