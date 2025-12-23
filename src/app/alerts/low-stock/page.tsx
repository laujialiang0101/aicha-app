import { query } from '@/lib/db'

async function getLowStockAlerts() {
  try {
    const result = await query(`
      SELECT 
        rm.name,
        rm.category,
        l.name as location_name,
        0 as current_qty,
        rm.unit
      FROM raw_materials rm
      CROSS JOIN locations l
      WHERE rm.is_active = true AND l.is_active = true
      LIMIT 20
    `)
    return result.rows
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export default async function LowStockPage() {
  const alerts = await getLowStockAlerts()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">📉 Low Stock Alerts</h1>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-lg">
          <p className="text-4xl mb-2">✅</p>
          <p className="text-green-700 font-medium">All stock levels are healthy!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert: any, idx: number) => (
            <div 
              key={idx}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{alert.name}</span>
                  <div className="text-sm text-gray-500">
                    {alert.location_name} • {alert.category}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold">
                    {alert.current_qty} {alert.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold">💡 Tip:</p>
        <p>Set up reorder rules in Settings to get automatic alerts when stock runs low.</p>
      </div>
    </div>
  )
}
