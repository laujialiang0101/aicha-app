'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StockItem {
  id: number
  name: string
  category: string
  base_unit: string
  carton_name: string
  pack_name: string
  units_per_pack: number
  packs_per_carton: number
  units_per_carton: number
}

interface StockCount {
  cartons: number
  packs: number
  units: number
}

export default function StockTakeForm({
  locationId,
  locationName,
  itemsByCategory
}: {
  locationId: number
  locationName: string
  itemsByCategory: Record<string, StockItem[]>
}) {
  const router = useRouter()
  const [counts, setCounts] = useState<Record<number, StockCount>>({})
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [staffName, setStaffName] = useState('')

  const categories = Object.keys(itemsByCategory).sort()

  const updateCount = (itemId: number, field: keyof StockCount, value: number) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId] || { cartons: 0, packs: 0, units: 0 },
        [field]: Math.max(0, value)
      }
    }))
  }

  const calculateTotal = (item: StockItem, count: StockCount): number => {
    if (!count) return 0
    return (count.cartons * item.units_per_carton) +
           (count.packs * item.units_per_pack) +
           count.units
  }

  const getItemsWithCounts = () => {
    return Object.entries(counts)
      .filter(([_, count]) => count.cartons > 0 || count.packs > 0 || count.units > 0)
      .map(([id, count]) => ({ id: parseInt(id), ...count }))
  }

  const handleSubmit = async () => {
    if (!staffName.trim()) {
      alert('Please enter your name')
      return
    }

    const itemsWithCounts = getItemsWithCounts()
    if (itemsWithCounts.length === 0) {
      alert('Please enter at least one item count')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/stock-take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          staffName,
          items: itemsWithCounts
        })
      })

      if (response.ok) {
        alert('Stock take saved successfully!')
        router.push('/stock-take')
      } else {
        const error = await response.json()
        alert('Error: ' + (error.message || 'Failed to save'))
      }
    } catch (error) {
      alert('Error saving stock take')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const countedItems = getItemsWithCounts().length
  const totalItems = Object.values(itemsByCategory).flat().length

  return (
    <div className="space-y-4 pb-32">
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
          className="w-full border rounded-lg p-3 text-lg"
        />
      </div>

      {/* Progress */}
      <div className="bg-white p-3 rounded-lg shadow flex items-center justify-between">
        <span className="text-gray-600">Progress</span>
        <span className="font-bold text-aicha-red">
          {countedItems} / {totalItems} items
        </span>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category ? null : category
              )}
              className="w-full p-4 flex items-center justify-between bg-gray-50 active:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold capitalize">{category}</span>
                <span className="text-sm text-gray-500">
                  ({itemsByCategory[category].length} items)
                </span>
              </div>
              <span className="text-xl">
                {expandedCategory === category ? '−' : '+'}
              </span>
            </button>

            {/* Items */}
            {expandedCategory === category && (
              <div className="divide-y">
                {itemsByCategory[category].map(item => {
                  const count = counts[item.id] || { cartons: 0, packs: 0, units: 0 }
                  const total = calculateTotal(item, count)

                  return (
                    <div key={item.id} className="p-4 space-y-3">
                      {/* Item Name */}
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{item.name}</span>
                        {total > 0 && (
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            = {total.toLocaleString()} {item.base_unit}
                          </span>
                        )}
                      </div>

                      {/* Count Inputs */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Cartons */}
                        <div>
                          <label className="block text-xs text-gray-500 text-center mb-1">
                            {item.carton_name}
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={count.cartons || ''}
                            onChange={(e) => updateCount(
                              item.id, 'cartons', parseInt(e.target.value) || 0
                            )}
                            placeholder="0"
                            className="w-full border-2 rounded-lg p-2 text-center text-lg font-bold focus:border-aicha-red focus:outline-none"
                          />
                          <div className="text-xs text-gray-400 text-center mt-1">
                            ×{item.units_per_carton}
                          </div>
                        </div>

                        {/* Packs */}
                        <div>
                          <label className="block text-xs text-gray-500 text-center mb-1">
                            {item.pack_name}
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={count.packs || ''}
                            onChange={(e) => updateCount(
                              item.id, 'packs', parseInt(e.target.value) || 0
                            )}
                            placeholder="0"
                            className="w-full border-2 rounded-lg p-2 text-center text-lg font-bold focus:border-aicha-red focus:outline-none"
                          />
                          <div className="text-xs text-gray-400 text-center mt-1">
                            ×{item.units_per_pack}
                          </div>
                        </div>

                        {/* Units */}
                        <div>
                          <label className="block text-xs text-gray-500 text-center mb-1">
                            {item.base_unit}
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={count.units || ''}
                            onChange={(e) => updateCount(
                              item.id, 'units', parseInt(e.target.value) || 0
                            )}
                            placeholder="0"
                            className="w-full border-2 rounded-lg p-2 text-center text-lg font-bold focus:border-aicha-red focus:outline-none"
                          />
                          <div className="text-xs text-gray-400 text-center mt-1">
                            ×1
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={saving || countedItems === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              saving || countedItems === 0
                ? 'bg-gray-300 text-gray-500'
                : 'bg-aicha-red text-white active:scale-98'
            }`}
          >
            {saving ? 'Saving...' : `Submit Stock Take (${countedItems} items)`}
          </button>
        </div>
      </div>
    </div>
  )
}
