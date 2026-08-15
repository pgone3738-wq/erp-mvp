'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const API_URL = 'https://erp-mvp-unc2.onrender.com'

type Contact = {
  id: string
  name: string
  email: string | null
  phone: string | null
  type: string // CUSTOMER or VENDOR
  createdAt: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('CUSTOMER')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    const token = localStorage.getItem('erp_token')
    const res = await fetch(`${API_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      setContacts(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('erp_token')
    const url = editingId ? `${API_URL}/contacts/${editingId}` : `${API_URL}/contacts`
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, phone, type })
      })

      if (res.ok) {
        toast.success(editingId ? 'Contact Updated!' : 'Contact Added!', {
          description: `${name} has been saved.`,
        })
        setEditingId(null)
        setName('')
        setEmail('')
        setPhone('')
        setType('CUSTOMER')
        fetchContacts()
      } else {
        const errorData = await res.json()
        toast.error('Failed to save contact', {
          description: errorData.message,
        })
      }
    } catch (error) {
      toast.error('Connection Error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (contact: Contact) => {
    setEditingId(contact.id)
    setName(contact.name)
    setEmail(contact.email || '')
    setPhone(contact.phone || '')
    setType(contact.type)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setPhone('')
    setType('CUSTOMER')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    const token = localStorage.getItem('erp_token')
    try {
      const res = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success('Contact Deleted!')
        if (editingId === id) handleCancelEdit()
        fetchContacts()
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      toast.error('Connection Error')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Contacts (CRM)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add/Edit Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Contact' : 'Add New Contact'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select 
                  id="type" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-gray-900"
                  required
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : (editingId ? 'Update Contact' : 'Add Contact')}
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

        {/* Contacts Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Phone</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
                        No contacts yet.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{contact.name}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${contact.type === 'CUSTOMER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {contact.type}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{contact.email || '-'}</td>
                        <td className="py-3 text-gray-600">{contact.phone || '-'}</td>
                        <td className="py-3 text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(contact)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(contact.id)}>
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