import { query } from '@/lib/db'

async function getExpiringItems() {
  try {
    const result = await query(`
      SELECT 
        b.id,
        rm.name as raw_material_name,
        l.name as location_name,
        b.batch_number,
        b.expiry_date,
        b.quantity_remaining,
        b.expiry_date - CURRENT_DATE as days_until_expiry
      FROM batches b
      JOIN raw_materials rm ON b.raw_material_id = rm.id
      JOIN locations l ON b.location_id = l.id
      WHERE b.quantity_remaining > 0
        AND b.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY b.expiry_date
    `)
    return result.rows
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export default async function ExpiringPage() {
  const items = await getExpiringItems()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">⏰ Expiring Items</h1>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-lg">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-green-700 font-medium">No items expiring soon!</p>
          <p className="text-green-600 text-sm mt-1">All batches have 30+ days remaining</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => {
            const days = item.days_until_expiry
            const isExpired = days < 0
            const isCritical = days <= 7
            const isWarning = days <= 14
            
            const borderColor = isExpired ? 'border-black' : isCritical ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-orange-400'
            const bgColor = isExpired ? 'bg-gray-100' : ''
            
            return (
              <div 
                key={item.id}
                className={`bg-white p-4 rounded-lg shadow border-l-4 ${borderColor} ${bgColor}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{item.raw_material_name}</span>
                    <div className="text-sm text-gray-500">
                      {item.location_name} • Batch: {item.batch_number}
                    </div>
                    <div className="text-sm text-gray-400">
                      Qty: {item.quantity_remaining}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${isExpired ? 'text-black' : isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                      {isExpired ? 'EXPIRED' : `${days} days`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.expiry_date).toLocaleDateString('en-MY')}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold">💡 Expiry Management:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>7 days or less</strong> — Use immediately or promote for sale</li>
          <li><strong>Expired</strong> — Remove from stock and dispose</li>
        </ul>
      </div>
    </div>
  )
}
