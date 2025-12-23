import { query } from '@/lib/db'
import Link from 'next/link'

async function getDashboardData() {
  try {
    // Get low stock alerts
    const lowStock = await query(`
      SELECT COUNT(*) as count FROM v_low_stock_alerts 
      WHERE stock_status IN ('CRITICAL', 'LOW')
    `)

    // Get expiring soon (next 7 days)
    const expiring = await query(`
      SELECT COUNT(*) as count FROM v_expiring_soon 
      WHERE days_until_expiry <= 7
    `)

    // Get pending requests
    const pending = await query(`
      SELECT COUNT(*) as count FROM stock_requests 
      WHERE status IN ('pending', 'approved', 'in_transit')
    `)

    // Get today's incomplete checklists
    const checklists = await query(`
      SELECT COUNT(*) as count FROM checklists c
      WHERE c.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM checklist_completions cc 
        WHERE cc.checklist_id = c.id 
        AND cc.completed_date = CURRENT_DATE
      )
    `)

    // Get stock value by location
    const stockValue = await query(`
      SELECT location_name, SUM(total_value_myr) as value
      FROM v_stock_value
      GROUP BY location_id, location_name
      ORDER BY location_name
    `)

    return {
      lowStockCount: lowStock.rows[0]?.count || 0,
      expiringCount: expiring.rows[0]?.count || 0,
      pendingRequests: pending.rows[0]?.count || 0,
      pendingChecklists: checklists.rows[0]?.count || 0,
      stockByLocation: stockValue.rows || []
    }
  } catch (error) {
    console.error('Dashboard error:', error)
    return {
      lowStockCount: 0,
      expiringCount: 0,
      pendingRequests: 0,
      pendingChecklists: 0,
      stockByLocation: []
    }
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-3">
        <QuickAction 
          href="/stock-take" 
          icon="📋" 
          label="Stock Take" 
          color="bg-blue-500"
        />
        <QuickAction 
          href="/transfer/new" 
          icon="📦" 
          label="Request Stock" 
          color="bg-green-500"
        />
        <QuickAction 
          href="/grn" 
          icon="📥" 
          label="Receive Goods" 
          color="bg-purple-500"
        />
        <QuickAction 
          href="/po" 
          icon="🛒" 
          label="Create PO" 
          color="bg-orange-500"
        />
      </section>

      {/* Alerts */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-700">⚠️ Alerts</h2>
        
        {data.lowStockCount > 0 && (
          <AlertCard 
            href="/alerts/low-stock"
            icon="📉" 
            title="Low Stock Items" 
            count={data.lowStockCount}
            color="status-critical"
          />
        )}
        
        {data.expiringCount > 0 && (
          <AlertCard 
            href="/alerts/expiring"
            icon="⏰" 
            title="Expiring Soon (7 days)" 
            count={data.expiringCount}
            color="status-low"
          />
        )}
        
        {data.pendingRequests > 0 && (
          <AlertCard 
            href="/transfer"
            icon="🔄" 
            title="Pending Transfers" 
            count={data.pendingRequests}
            color="status-low"
          />
        )}
        
        {data.pendingChecklists > 0 && (
          <AlertCard 
            href="/checklist"
            icon="✅" 
            title="Incomplete Checklists" 
            count={data.pendingChecklists}
            color="status-low"
          />
        )}

        {data.lowStockCount === 0 && data.expiringCount === 0 && 
         data.pendingRequests === 0 && data.pendingChecklists === 0 && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
            ✅ All good! No alerts.
          </div>
        )}
      </section>

      {/* Stock Value Summary */}
      {data.stockByLocation.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-gray-700">💰 Stock Value</h2>
          <div className="bg-white rounded-lg shadow divide-y">
            {data.stockByLocation.map((loc: any) => (
              <div key={loc.location_name} className="p-3 flex justify-between">
                <span className="text-gray-600">{loc.location_name}</span>
                <span className="font-semibold">
                  RM {Number(loc.value || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Today's Date */}
      <div className="text-center text-gray-400 text-sm pt-4">
        {new Date().toLocaleDateString('en-MY', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  )
}

function QuickAction({ href, icon, label, color }: { 
  href: string; icon: string; label: string; color: string 
}) {
  return (
    <Link 
      href={href}
      className={`${color} text-white rounded-xl p-4 flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform`}
    >
      <span className="text-3xl mb-1">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function AlertCard({ href, icon, title, count, color }: {
  href: string; icon: string; title: string; count: number; color: string
}) {
  return (
    <Link href={href} className={`${color} p-3 rounded-lg flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="font-medium">{title}</span>
      </div>
      <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-bold">
        {count}
      </span>
    </Link>
  )
}
