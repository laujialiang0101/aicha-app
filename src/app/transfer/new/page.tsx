'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Location {
  id: number
  name: string
  type: string
}

interface RawMaterial {
  id: number
  name: string
  category: string
  unit: string
}

export default function NewTransferPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [staffName, setStaffName] = useState('')
  const [items, setItems] = useState<{materialId: number, qty: number}[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [locRes, matRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/materials')
        ])
        const locData = await locRes.json()
        const matData = await matRes.json()
        setLocations(locData)
        setMaterials(matData)
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

  const handleSubmit = async () => {
    if (!fromLocation || !toLocation || !staffName || items.length === 0) {
      alert('Please fill in all fields and add at least one item')
      return
    }

    if (fromLocation === toLocation) {
      alert('From and To locations must be different')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLocationId: fromLocation,
          toLocationId: toLocation,
          requestedBy: staffName,
          items: items.filter(i => i.materialId > 0 && i.qty > 0)
        })
      })

      if (response.ok) {
        alert('Transfer request submitted!')
        router.push('/transfer')
      } else {
        const error = await response.json()
        alert('Error: ' + (error.message || 'Failed to save'))
      }
    } catch (error) {
      alert('Error submitting request')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const warehouses = locations.filter(l => l.type === 'warehouse')
  const outlets = locations.filter(l => l.type === 'outlet')

  return (
    <div className="space-y-4 pb-32">
      <h1 className="text-xl font-bold text-gray-800">📦 New Stock Request</h1>

      {/* From Location (Warehouse) */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request From (Warehouse)
        </label>
        <select
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
          className="w-full border rounded-lg p-3 text-lg"
        >
          <option value="">Select warehouse...</option>
          {warehouses.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* To Location (Outlet) */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deliver To (Outlet)
        </label>
        <select
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          className="w-full border rounded-lg p-3 text-lg"
        >
          <option value="">Select outlet...</option>
          {outlets.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Staff Name */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
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

      {/* Items */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Items Requested</label>
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
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={item.materialId}
                  onChange={(e) => updateItem(index, 'materialId', parseInt(e.target.value))}
                  className="flex-1 border rounded p-2 text-sm"
                >
                  <option value={0}>Select item...</option>
                  {materials.map(mat => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.unit})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                  className="w-20 border rounded p-2 text-center"
                  min="1"
                />
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
                : 'bg-aicha-red text-white'
            }`}
          >
            {saving ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
