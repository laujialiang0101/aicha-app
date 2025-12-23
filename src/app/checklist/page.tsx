import { query } from '@/lib/db'
import Link from 'next/link'

async function getChecklists() {
  try {
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.checklist_type,
        c.location_type,
        COUNT(ci.id) as item_count,
        (
          SELECT completed_at 
          FROM checklist_completions cc 
          WHERE cc.checklist_id = c.id 
          AND cc.completed_date = CURRENT_DATE 
          LIMIT 1
        ) as completed_today
      FROM checklists c
      LEFT JOIN checklist_items ci ON c.id = ci.checklist_id
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.checklist_type, c.location_type
      ORDER BY 
        CASE c.checklist_type 
          WHEN 'opening' THEN 1 
          WHEN 'closing' THEN 2 
          WHEN 'weekly' THEN 3 
          ELSE 4 
        END
    `)
    return result.rows
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

const typeIcons: Record<string, string> = {
  opening: '🌅',
  closing: '🌙',
  weekly: '📅',
  monthly: '📆'
}

const typeColors: Record<string, string> = {
  opening: 'border-l-orange-400',
  closing: 'border-l-purple-400',
  weekly: 'border-l-blue-400',
  monthly: 'border-l-green-400'
}

export default async function ChecklistPage() {
  const checklists = await getChecklists()

  const today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">✅ Checklists</h1>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      {/* Today's Checklists */}
      <section className="space-y-2">
        <h2 className="font-semibold text-gray-600">Today's Tasks</h2>
        
        {checklists.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📝</p>
            <p>No checklists configured</p>
          </div>
        ) : (
          <div className="space-y-2">
            {checklists.map((checklist: any) => (
              <Link
                key={checklist.id}
                href={`/checklist/${checklist.id}`}
                className={`block bg-white p-4 rounded-lg shadow border-l-4 ${typeColors[checklist.checklist_type] || 'border-l-gray-400'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {typeIcons[checklist.checklist_type] || '📋'}
                    </span>
                    <div>
                      <span className="font-medium">{checklist.name}</span>
                      <div className="text-xs text-gray-500">
                        {checklist.item_count} items • {checklist.location_type}
                      </div>
                    </div>
                  </div>
                  
                  {checklist.completed_today ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Done
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                      Pending
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Completed today:</span>
          <span className="font-bold text-green-600">
            {checklists.filter((c: any) => c.completed_today).length} / {checklists.length}
          </span>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Checklist Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Complete <strong>Opening</strong> checklist before first customer</li>
          <li>Prepare milk tea base during <strong>Closing</strong> for next day</li>
          <li>Always return Popping Boba to chiller!</li>
        </ul>
      </div>
    </div>
  )
}
