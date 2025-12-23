import { query } from '@/lib/db'
import Link from 'next/link'

async function getLocations() {
  try {
    const result = await query(`
      SELECT id, name, type 
      FROM locations 
      WHERE is_active = true 
      ORDER BY type, name
    `)
    return result.rows
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
}

async function getRecentStockTakes() {
  try {
    const result = await query(`
      SELECT 
        l.name as location_name,
        st.stock_take_date,
        COUNT(*) as item_count,
        st.created_by
      FROM stock_takes st
      JOIN locations l ON st.location_id = l.id
      WHERE st.stock_take_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY l.name, st.stock_take_date, st.created_by
      ORDER BY st.stock_take_date DESC
      LIMIT 5
    `)
    return result.rows
  } catch (error) {
    console.error('Error fetching recent stock takes:', error)
    return []
  }
}

export default async function StockTakePage() {
  const locations = await getLocations()
  const recentTakes = await getRecentStockTakes()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">📋 Stock Take</h1>

      {/* Select Location */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600">Select Location</h2>
        <div className="space-y-2">
          {locations.map((loc: any) => (
            <Link
              key={loc.id}
              href={`/stock-take/${loc.id}`}
              className="block bg-white p-4 rounded-lg shadow border-l-4 border-aicha-red active:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">{loc.name}</span>
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {loc.type}
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Stock Takes */}
      {recentTakes.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-600">Recent (Last 7 Days)</h2>
          <div className="bg-white rounded-lg shadow divide-y">
            {recentTakes.map((take: any, idx: number) => (
              <div key={idx} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{take.location_name}</span>
                    <div className="text-sm text-gray-500">
                      {take.item_count} items • {take.created_by || 'Unknown'}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(take.stock_take_date).toLocaleDateString('en-MY')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Instructions */}
      <section className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 How to count:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Count by <strong>Carton</strong> first (unopened boxes)</li>
          <li>Then count <strong>Packs/Bags/Cans</strong> (opened cartons)</li>
          <li>Finally count <strong>Loose Units</strong></li>
          <li>System will auto-calculate total</li>
        </ul>
      </section>
    </div>
  )
}
