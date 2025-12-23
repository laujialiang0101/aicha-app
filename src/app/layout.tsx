import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ai-CHA Operations',
  description: 'Inventory & Operations Management',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 pb-20">
        {/* Header */}
        <header className="bg-aicha-red text-white p-4 sticky top-0 z-40 shadow-md">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <h1 className="text-xl font-bold">🧋 Ai-CHA</h1>
            <span className="text-sm opacity-80">Operations</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-lg mx-auto p-4">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="max-w-lg mx-auto flex justify-around">
            <NavItem href="/" icon="🏠" label="Home" />
            <NavItem href="/stock-take" icon="📋" label="Stock" />
            <NavItem href="/transfer" icon="🔄" label="Transfer" />
            <NavItem href="/checklist" icon="✅" label="Tasks" />
            <NavItem href="/more" icon="⚙️" label="More" />
          </div>
        </nav>
      </body>
    </html>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-aicha-red tap-target"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}
