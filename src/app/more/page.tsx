import Link from 'next/link'

export default function MorePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">⚙️ More</h1>

      {/* Operations */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600 text-sm">Operations</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          <MenuItem href="/grn" icon="📥" label="Receive Goods (GRN)" />
          <MenuItem href="/po" icon="🛒" label="Create PO" />
          <MenuItem href="/alerts/low-stock" icon="📉" label="Low Stock Alerts" />
          <MenuItem href="/alerts/expiring" icon="⏰" label="Expiring Items" />
        </div>
      </section>

      {/* Reports */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600 text-sm">Reports</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          <MenuItem href="/reports/stock-value" icon="💰" label="Stock Value Report" />
          <MenuItem href="/reports/variance" icon="📊" label="Variance Analysis" />
          <MenuItem href="/reports/movement" icon="📈" label="Stock Movement History" />
        </div>
      </section>

      {/* Settings */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600 text-sm">Settings</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          <MenuItem href="/settings/locations" icon="📍" label="Locations" />
          <MenuItem href="/settings/materials" icon="📦" label="Raw Materials" />
          <MenuItem href="/settings/products" icon="🧋" label="Menu Items" />
          <MenuItem href="/settings/users" icon="👥" label="Users" />
        </div>
      </section>

      {/* Help */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600 text-sm">Help</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          <MenuItem href="/help/guide" icon="📖" label="User Guide" />
          <MenuItem href="/help/contact" icon="💬" label="Contact Support" />
        </div>
      </section>

      {/* App Info */}
      <div className="text-center py-4 text-gray-400 text-sm">
        <p>Ai-CHA Operations v1.0</p>
        <p>Built for Langkah F&B</p>
      </div>
    </div>
  )
}

function MenuItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 active:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-gray-400">→</span>
    </Link>
  )
}
