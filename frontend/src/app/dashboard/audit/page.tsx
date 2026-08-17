'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = 'https://erp-mvp-unc2.onrender.com'

type AuditLog = {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  createdAt: string
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('erp_token')
        const res = await fetch(`${API_URL}/audit`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setLogs(data)
        }
      } catch (error) {
        toast.error('Failed to fetch audit logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const formatActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Audit Logs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity (Last 50 Actions)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Timestamp</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Entity</th>
                    <th className="pb-2 font-medium">Entity ID</th>
                    <th className="pb-2 font-medium">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
                        No activity recorded yet. Try creating or editing an item!
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-3 text-gray-600 text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${formatActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-gray-900">{log.entity}</td>
                        <td className="py-3 text-gray-500 text-xs font-mono">
                          {log.entityId ? `${log.entityId.substring(0, 8)}...` : '-'}
                        </td>
                        <td className="py-3 text-gray-500 text-xs font-mono">
                          {log.userId ? `${log.userId.substring(0, 8)}...` : 'System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}