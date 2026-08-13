'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type JournalLine = {
  id: string
  debit: number
  credit: number
  account: {
    code: string
    name: string
  }
}

type JournalEntry = {
  id: string
  date: string
  reference: string
  description: string
  lines: JournalLine[]
}

export default function AccountingPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    const fetchJournal = async () => {
      const token = localStorage.getItem('erp_token')
      const res = await fetch('http://localhost:3000/journal', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setEntries(data)
      }
    }
    fetchJournal()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">General Ledger (Journal)</h1>
      
      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-400">
              No journal entries yet. Create an invoice or a bill to see accounting magic happen!
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-gray-800">{entry.reference}</CardTitle>
                    <p className="text-sm text-gray-500">{entry.description}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(entry.date).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 font-medium">Account</th>
                        <th className="pb-2 font-medium">Account Name</th>
                        <th className="pb-2 font-medium text-right">Debit</th>
                        <th className="pb-2 font-medium text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line) => (
                        <tr key={line.id} className="border-b last:border-0">
                          <td className="py-3 font-mono text-gray-600">{line.account.code}</td>
                          <td className="py-3 text-gray-800">{line.account.name}</td>
                          <td className="py-3 text-right text-gray-600">
                            {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 text-right text-gray-600">
                            {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}