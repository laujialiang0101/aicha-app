'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RawMaterial {
  id: number
  name: string
  category: string
  unit: string
  supplier_code: string
  cost_myr: number
  packing_size: string
}

export default function NewPOPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [staffName, setStaffName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<{materialId: number, qty: number}[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const matRes = await fetch('/api/materials')
        const matData = await matRes.json()
        // Only show items with supplier codes (orderable items)
        setMaterials(matData.filter((m: RawMaterial) => m.supplier_code))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const addItem = () => {
    setItems([...items, { materialId: 0, qty: 1 }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const getMaterial = (id: number) => materials.find(m => m.id === id)

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const mat = getMaterial(item.materialId)
      if (mat && mat.cost_myr) {
        return sum + (mat.cost_myr * item.qty)
      }
      return sum
    }, 0)
  }

  const handleSubmit = async () => {
    if (!staffName || items.length === 0) {
      alert('Please fill in all fields and add at least one item')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy: staffName,
          notes,
          items: items.filter(i => i.materialId > 0 && i.qty > 0).map(i => ({
            materialId: i.materialId,
            quantity: i.qty,
            unitPrice: getMaterial(i.materialId)?.cost_myr || 0
          }))
        })
      })

      if (response.ok) {
        alert('Purchase order created!')
        router.push('/po')
      } else {
        const error = await response.json()
        alert('Error: ' + (error.message || 'Failed to save'))
      }
    } catch (error) {
      alert('Error creating PO')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  // Group materials by category
  const groupedMaterials: Record<string, RawMaterial[]> = {}
  materials.forEach(mat => {
    const cat = mat.category || 'Other'
    if (!groupedMaterials[cat]) groupedMaterials[cat] = []
    groupedMaterials[cat].push(mat)
  })

  return (
    <div className="space-y-4 pb-32">
      <h1 className="text-xl font-bold text-gray-800">🛒 Create Purchase Order</h1>

      {/* Staff Name */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Created By
        </label>
        <input
          type="text"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
          placeholder="Enter your name"
          className="w-full border rounded-lg p-3 text-lg"
        />
      </div>

      {/* Items */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Order Items</label>
          <button
            onClick={addItem}
            className="bg-aicha-red text-white px-3 py-1 rounded text-sm"
          >
            + Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No items added yet</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const mat = getMaterial(item.materialId)
              const lineTotal = mat ? (mat.cost_myr || 0) * item.qty : 0
              
              return (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2 items-center">
                    <select
                      value={item.materialId}
                      onChange={(e) => updateItem(index, 'materialId', parseInt(e.target.value))}
                      className="flex-1 border rounded p-2 text-sm"
                    >
                      <option value={0}>Select item...</option>
                      {Object.entries(groupedMaterials).map(([cat, mats]) => (
                        <optgroup key={cat} label={cat.toUpperCase()}>
                          {mats.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} - RM{m.cost_myr?.toFixed(2) || '?'}/ctn
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 px-2"
                    >
                      ✕
                    </button>
                  </div>
                  {mat && (
                    <div className="text-xs text-gray-500">
                      {mat.supplier_code} • {mat.packing_size}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Qty (cartons):</span>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                      className="w-20 border rounded p-2 text-center"
                      min="1"
                    />
                    <span className="ml-auto font-semibold text-aicha-red">
                      RM {lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Total */}
        {items.length > 0 && (
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-bold">Total</span>
            <span className="font-bold text-xl text-aicha-red">
              RM {calculateTotal().toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          className="w-full border rounded-lg p-3"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={saving || items.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg ${
              saving || items.length === 0
                ? 'bg-gray-300 text-gray-500'
                : 'bg-orange-500 text-white'
            }`}
          >
            {saving ? 'Creating...' : `Create PO - RM ${calculateTotal().toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
