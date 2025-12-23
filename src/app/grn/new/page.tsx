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

export default function NewGRNPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [location, setLocation] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [staffName, setStaffName] = useState('')
  const [items, setItems] = useState<{materialId: number, qty: number, expiryDate: string}[]>([])
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
    setItems([...items, { materialId: 0, qty: 1, expiryDate: '' }])
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
    if (!location || !staffName || items.length === 0) {
      alert('Please fill in all fields and add at least one item')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/grn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: location,
          referenceNo,
          createdBy: staffName,
          items: items.filter(i => i.materialId > 0 && i.qty > 0)
        })
      })

      if (response.ok) {
        alert('Goods received successfully!')
        router.push('/grn')
      } else {
        const error = await response.json()
        alert('Error: ' + (error.message || 'Failed to save'))
      }
    } catch (error) {
      alert('Error saving GRN')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4 pb-32">
      <h1 className="text-xl font-bold text-gray-800">📥 Receive Goods</h1>

      {/* Location */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receiving Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded-lg p-3 text-lg"
        >
          <option value="">Select location...</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Reference No */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          PO / DO Reference (Optional)
        </label>
        <input
          type="text"
          value={referenceNo}
          onChange={(e) => setReferenceNo(e.target.value)}
          placeholder="e.g., PO-001 or DO-12345"
          className="w-full border rounded-lg p-3 text-lg"
        />
      </div>

      {/* Staff Name */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Received By
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
          <label className="font-medium text-gray-700">Items Received</label>
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
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <select
                    value={item.materialId}
                    onChange={(e) => updateItem(index, 'materialId', parseInt(e.target.value))}
                    className="flex-1 border rounded p-2 text-sm"
                  >
                    <option value={0}>Select item...</option>
                    {materials.map(mat => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-500 px-2"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Quantity</label>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                      className="w-full border rounded p-2 text-center"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Expiry Date</label>
                    <input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>
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
                : 'bg-green-500 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Confirm Receipt'}
          </button>
        </div>
      </div>
    </div>
  )
}
