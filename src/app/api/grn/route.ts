import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, referenceNo, createdBy, items } = body

    if (!locationId || !createdBy || !items?.length) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert each item as a stock movement
    for (const item of items) {
      // Create stock movement (GRN type)
      await query(`
        INSERT INTO stock_movements (
          movement_type, 
          raw_material_id, 
          to_location_id, 
          quantity, 
          reference_no, 
          created_by
        )
        VALUES ('grn', $1, $2, $3, $4, $5)
      `, [item.materialId, locationId, item.qty, referenceNo || null, createdBy])

      // If expiry date provided, create batch record
      if (item.expiryDate) {
        const batchNumber = `B-${Date.now().toString().slice(-8)}`
        await query(`
          INSERT INTO batches (
            raw_material_id,
            batch_number,
            expiry_date,
            quantity_received,
            quantity_remaining,
            location_id,
            po_reference
          )
          VALUES ($1, $2, $3, $4, $4, $5, $6)
        `, [item.materialId, batchNumber, item.expiryDate, item.qty, locationId, referenceNo || null])
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${items.length} items received` 
    })
  } catch (error) {
    console.error('GRN error:', error)
    return NextResponse.json(
      { message: 'Failed to save GRN' },
      { status: 500 }
    )
  }
}
