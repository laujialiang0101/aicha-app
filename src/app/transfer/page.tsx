import { query } from '@/lib/db'
import Link from 'next/link'

async function getTransferRequests() {
  try {
    const result = await query(`
      SELECT 
        sr.id,
        sr.request_number,
        fl.name as from_location,
        tl.name as to_location,
        sr.status,
        sr.requested_by,
        sr.requested_at,
        COUNT(sri.id) as item_count
      FROM stock_requests sr
      JOIN locations fl ON sr.from_location_id = fl.id
      JOIN locations tl ON sr.to_location_id = tl.id
      LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
      GROUP BY sr.id, sr.request_number, fl.name, tl.name, sr.status, sr.requested_by, sr.requested_at
      ORDER BY sr.requested_at DESC
      LIMIT 20
    `)
    return result.rows
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-purple-100 text-purple-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const statusIcons: Record<string, string> = {
  pending: '⏳',
  approved: '✅',
  in_transit: '🚚',
  received: '📦',
  cancelled: '❌'
}

export default async function TransferPage() {
  const requests = await getTransferRequests()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">🔄 Transfers</h1>
        <Link
          href="/transfer/new"
          className="bg-aicha-red text-white px-4 py-2 rounded-lg font-medium text-sm"
        >
          + New Request
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'in_transit', 'received'].map(status => (
          <button
            key={status}
            className="px-3 py-1 rounded-full text-sm whitespace-nowrap bg-gray-100 text-gray-600"
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📦</p>
          <p>No transfer requests yet</p>
          <Link
            href="/transfer/new"
            className="text-aicha-red font-medium mt-2 inline-block"
          >
            Create your first request →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req: any) => (
            <Link
              key={req.id}
              href={`/transfer/${req.id}`}
              className="block bg-white p-4 rounded-lg shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{req.request_number || `#${req.id}`}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                      {statusIcons[req.status]} {req.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {req.from_location} → {req.to_location}
                  </div>
                  <div className="text-xs text-gray-400">
                    {req.item_count} items • {req.requested_by}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(req.requested_at).toLocaleDateString('en-MY')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Guide */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mt-4">
        <p className="font-semibold mb-1">📋 Transfer Flow:</p>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending</span>
          <span>→</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Approved</span>
          <span>→</span>
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">In Transit</span>
          <span>→</span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Received</span>
        </div>
      </div>
    </div>
  )
}
