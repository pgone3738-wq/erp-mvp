'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

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
  
  // New state to track if we are editing an item
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/items`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      setItems(data)
    }
  }

  // Handles both Creating and Updating
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('erp_token')
    const url = editingId 
      ? `${API_URL}/items/${editingId}` 
      : `${API_URL}/items`
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method: method,
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
        toast.success(editingId ? 'Item Updated!' : 'Product Added!', {
          description: `${name} has been saved.`,
        })
        resetForm()
        fetchItems()
      } else {
        const errorData = await res.json()
        toast.error('Failed to save item', {
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

  // Populates the form with the item's data to edit
  const handleEditClick = (item: Item) => {
    setEditingId(item.id)
    setName(item.name)
    setSku(item.sku)
    setPrice(item.price.toString())
    // Scroll to top so the user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setSku('')
    setPrice('')
  }

  // Handles deleting an item
  const handleDelete = async (id: string) => {
    // Simple confirmation
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem('erp_token')
    try {
      const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success('Item Deleted!', {
          description: 'The item has been removed from your catalog.',
        })
        // If we were editing this item, clear the form
        if (editingId === id) resetForm()
        fetchItems()
      } else {
        toast.error('Failed to delete item')
      }
    } catch (error) {
      toast.error('Connection Error')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Catalog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add/Edit Item Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : (editingId ? 'Update Item' : 'Add to Catalog')}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
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
                    <th className="pb-2 font-medium text-right">Actions</th> {/* NEW COLUMN */}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
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
                        <td className="py-3 text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                            Delete
                          </Button>
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