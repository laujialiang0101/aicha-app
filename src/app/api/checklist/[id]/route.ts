import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get checklist
    const checklistResult = await query(
      'SELECT id, name, checklist_type FROM checklists WHERE id = $1',
      [params.id]
    )
    
    if (checklistResult.rows.length === 0) {
      return NextResponse.json({ checklist: null, items: [] })
    }

    // Get items
    const itemsResult = await query(`
      SELECT id, item_text, is_required, sort_order
      FROM checklist_items
      WHERE checklist_id = $1
      ORDER BY sort_order, id
    `, [params.id])

    return NextResponse.json({
      checklist: checklistResult.rows[0],
      items: itemsResult.rows
    })
  } catch (error) {
    console.error('Error fetching checklist:', error)
    return NextResponse.json({ checklist: null, items: [] })
  }
}
