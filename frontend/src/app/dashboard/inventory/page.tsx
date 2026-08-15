'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

// Your live Render Backend URL
const API_URL = 'https://erp-mvp-unc2.onrender.com'

type Item = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/items`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      setItems(data)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          sku, 
          price: parseFloat(price)
        })
      })

      if (res.ok) {
        toast.success('Product Added!', {
          description: `${name} has been added to your catalog.`,
        })
        setName('')
        setSku('')
        setPrice('')
        fetchItems()
      } else {
        const errorData = await res.json()
        toast.error('Failed to add item', {
          description: errorData.message,
        })
      }
    } catch (error) {
      toast.error('Connection Error', {
        description: 'Could not connect to the backend.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Catalog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Item Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Product Code)</Label>
                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Sale Price ($)</Label>
                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Add to Catalog'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Items List Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">
                        No items in catalog yet.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="py-3 text-gray-600">{item.sku}</td>
                        <td className="py-3 text-right text-gray-600">${item.price.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.stock}
                          </span>
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