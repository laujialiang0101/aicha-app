import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checklistId, completedBy, notes, responses, locationId } = body

    if (!checklistId || !completedBy) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create completion record
    const completionResult = await query(`
      INSERT INTO checklist_completions (checklist_id, location_id, completed_by, notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (checklist_id, location_id, completed_date) 
      DO UPDATE SET completed_by = $3, notes = $4, completed_at = NOW()
      RETURNING id
    `, [checklistId, locationId || 1, completedBy, notes || null])

    const completionId = completionResult.rows[0].id

    // Save responses
    if (responses && responses.length > 0) {
      for (const response of responses) {
        await query(`
          INSERT INTO checklist_responses (completion_id, item_id, is_checked)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [completionId, response.itemId, response.isChecked])
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Checklist completed' 
    })
  } catch (error) {
    console.error('Checklist error:', error)
    return NextResponse.json(
      { message: 'Failed to save checklist' },
      { status: 500 }
    )
  }
}
