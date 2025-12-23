import { query } from '@/lib/db'
import Link from 'next/link'

async function getRecentGRNs() {
  try {
    const result = await query(`
      SELECT 
        sm.id,
        sm.reference_no,
        sm.movement_date,
        l.name as location_name,
        COUNT(*) as item_count,
        sm.created_by
      FROM stock_movements sm
      JOIN locations l ON sm.to_location_id = l.id
      WHERE sm.movement_type = 'grn'
      GROUP BY sm.id, sm.reference_no, sm.movement_date, l.name, sm.created_by
      ORDER BY sm.movement_date DESC, sm.created_at DESC
      LIMIT 10
    `)
    return result.rows
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export default async function GRNPage() {
  const recentGRNs = await getRecentGRNs()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">📥 Receive Goods</h1>
        <Link
          href="/grn/new"
          className="bg-aicha-red text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          + New GRN
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/grn/new?type=po"
          className="bg-purple-500 text-white p-4 rounded-xl text-center"
        >
          <span className="text-2xl block mb-1">📦</span>
          <span className="text-sm">From PO</span>
        </Link>
        <Link
          href="/grn/new?type=transfer"
          className="bg-blue-500 text-white p-4 rounded-xl text-center"
        >
          <span className="text-2xl block mb-1">🔄</span>
          <span className="text-sm">From Transfer</span>
        </Link>
      </div>

      {/* Recent GRNs */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600">Recent Receipts</h2>
        
        {recentGRNs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            <p className="text-4xl mb-2">📥</p>
            <p>No goods received yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            {recentGRNs.map((grn: any) => (
              <div key={grn.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{grn.reference_no || `GRN-${grn.id}`}</span>
                    <div className="text-sm text-gray-500">
                      {grn.location_name} • {grn.item_count} items
                    </div>
                    <div className="text-xs text-gray-400">{grn.created_by}</div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(grn.movement_date).toLocaleDateString('en-MY')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Always check expiry dates when receiving</li>
          <li>Count items before signing delivery note</li>
          <li>Report damaged items immediately</li>
        </ul>
      </div>
    </div>
  )
}
