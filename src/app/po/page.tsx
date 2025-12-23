import { query } from '@/lib/db'
import Link from 'next/link'

async function getPOData() {
  try {
    // Get recent POs
    const pos = await query(`
      SELECT 
        po.id,
        po.po_number,
        po.po_date,
        po.status,
        po.total_amount,
        COUNT(pi.id) as item_count
      FROM purchase_orders po
      LEFT JOIN po_items pi ON po.id = pi.po_id
      GROUP BY po.id
      ORDER BY po.po_date DESC
      LIMIT 10
    `)

    // Get low stock items for suggestion
    const lowStock = await query(`
      SELECT COUNT(*) as count FROM v_low_stock_alerts
      WHERE stock_status IN ('CRITICAL', 'LOW')
    `)

    return {
      purchaseOrders: pos.rows,
      lowStockCount: lowStock.rows[0]?.count || 0
    }
  } catch (error) {
    console.error('Error:', error)
    return { purchaseOrders: [], lowStockCount: 0 }
  }
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-purple-100 text-purple-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default async function POPage() {
  const { purchaseOrders, lowStockCount } = await getPOData()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">🛒 Purchase Orders</h1>
        <Link
          href="/po/new"
          className="bg-aicha-red text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          + New PO
        </Link>
      </div>

      {/* Smart Suggestion */}
      {lowStockCount > 0 && (
        <Link
          href="/po/new?auto=true"
          className="block bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">🤖 Smart Order Suggestion</p>
              <p className="text-sm opacity-90">
                {lowStockCount} items need reordering
              </p>
            </div>
            <span className="text-2xl">→</span>
          </div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/po/new"
          className="bg-white p-4 rounded-xl shadow text-center"
        >
          <span className="text-2xl block mb-1">✍️</span>
          <span className="text-sm text-gray-600">Manual PO</span>
        </Link>
        <Link
          href="/po/export"
          className="bg-white p-4 rounded-xl shadow text-center"
        >
          <span className="text-2xl block mb-1">📤</span>
          <span className="text-sm text-gray-600">Export Excel</span>
        </Link>
      </div>

      {/* PO List */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600">Recent Orders</h2>
        
        {purchaseOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            <p className="text-4xl mb-2">🛒</p>
            <p>No purchase orders yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            {purchaseOrders.map((po: any) => (
              <Link
                key={po.id}
                href={`/po/${po.id}`}
                className="block p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{po.po_number || `PO-${po.id}`}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[po.status]}`}>
                        {po.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {po.item_count} items
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-aicha-red">
                      RM {Number(po.total_amount || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(po.po_date).toLocaleDateString('en-MY')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Export Info */}
      <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
        <p className="font-semibold mb-1">📤 Export to Ai-CHA Format</p>
        <p className="text-green-700">
          POs can be exported to the official Ai-CHA Excel template for submission to franchise HQ.
        </p>
      </div>
    </div>
  )
}
