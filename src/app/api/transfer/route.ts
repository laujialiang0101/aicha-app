import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromLocationId, toLocationId, requestedBy, items } = body

    if (!fromLocationId || !toLocationId || !requestedBy || !items?.length) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate request number
    const requestNumber = `TR-${Date.now().toString().slice(-8)}`

    // Create stock request
    const requestResult = await query(`
      INSERT INTO stock_requests (request_number, from_location_id, to_location_id, requested_by, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id
    `, [requestNumber, fromLocationId, toLocationId, requestedBy])

    const requestId = requestResult.rows[0].id

    // Add items
    for (const item of items) {
      await query(`
        INSERT INTO stock_request_items (request_id, raw_material_id, quantity_requested)
        VALUES ($1, $2, $3)
      `, [requestId, item.materialId, item.qty])
    }

    return NextResponse.json({ 
      success: true, 
      requestNumber,
      message: 'Transfer request created' 
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json(
      { message: 'Failed to create transfer request' },
      { status: 500 }
    )
  }
}

export async function GET() {
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
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    return NextResponse.json([])
  }
}
