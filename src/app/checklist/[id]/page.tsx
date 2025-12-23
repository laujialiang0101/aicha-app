'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ChecklistItem {
  id: number
  item_text: string
  is_required: boolean
  sort_order: number
}

interface Checklist {
  id: number
  name: string
  checklist_type: string
}

export default function ChecklistDetailPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [responses, setResponses] = useState<Record<number, boolean>>({})
  const [staffName, setStaffName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/checklist/${params.id}`)
        const data = await res.json()
        setChecklist(data.checklist)
        setItems(data.items || [])
      } catch (error) {
        console.error('Error loading checklist:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  const toggleItem = (itemId: number) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const completedCount = Object.values(responses).filter(Boolean).length
  const requiredItems = items.filter(i => i.is_required)
  const allRequiredComplete = requiredItems.every(i => responses[i.id])

  const handleSubmit = async () => {
    if (!staffName.trim()) {
      alert('Please enter your name')
      return
    }

    if (!allRequiredComplete) {
      alert('Please complete all required items')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/checklist/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistId: params.id,
          completedBy: staffName,
          notes,
          responses: Object.entries(responses).map(([itemId, checked]) => ({
            itemId: parseInt(itemId),
            isChecked: checked
          }))
        })
      })

      if (response.ok) {
        alert('Checklist completed!')
        router.push('/checklist')
      } else {
        const error = await response.json()
        alert('Error: ' + (error.message || 'Failed to save'))
      }
    } catch (error) {
      alert('Error saving checklist')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!checklist) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Checklist not found</p>
      </div>
    )
  }

  const typeIcons: Record<string, string> = {
    opening: '🌅',
    closing: '🌙',
    weekly: '📅'
  }

  return (
    <div className="space-y-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{typeIcons[checklist.checklist_type] || '📋'}</span>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{checklist.name}</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-MY', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'short' 
            })}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white p-3 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-bold">
            {completedCount} / {items.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Staff Name */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Enter your name"
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-lg shadow divide-y">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
              responses[item.id] ? 'bg-green-50' : ''
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              responses[item.id] 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300'
            }`}>
              {responses[item.id] && '✓'}
            </div>
            <div className="flex-1">
              <span className={responses[item.id] ? 'text-gray-500 line-through' : ''}>
                {item.item_text}
              </span>
              {item.is_required && !responses[item.id] && (
                <span className="text-red-500 text-xs ml-2">*Required</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any issues or comments..."
          className="w-full border rounded-lg p-3"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={saving || !allRequiredComplete}
            className={`w-full py-4 rounded-xl font-bold text-lg ${
              saving || !allRequiredComplete
                ? 'bg-gray-300 text-gray-500'
                : 'bg-green-500 text-white'
            }`}
          >
            {saving ? 'Saving...' : !allRequiredComplete 
              ? `Complete Required Items (${requiredItems.filter(i => responses[i.id]).length}/${requiredItems.length})`
              : '✓ Complete Checklist'}
          </button>
        </div>
      </div>
    </div>
  )
}
