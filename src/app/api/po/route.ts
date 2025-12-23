import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { createdBy, notes, items } = body

    if (!createdBy || !items?.length) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate PO number
    const poNumber = `PO-${Date.now().toString().slice(-8)}`

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity)
    }, 0)

    // Create PO
    const poResult = await query(`
      INSERT INTO purchase_orders (po_number, status, total_amount, notes, created_by)
      VALUES ($1, 'draft', $2, $3, $4)
      RETURNING id
    `, [poNumber, totalAmount, notes || null, createdBy])

    const poId = poResult.rows[0].id

    // Add items
    for (const item of items) {
      const totalPrice = item.unitPrice * item.quantity
      await query(`
        INSERT INTO po_items (po_id, raw_material_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5)
      `, [poId, item.materialId, item.quantity, item.unitPrice, totalPrice])
    }

    return NextResponse.json({ 
      success: true, 
      poNumber,
      message: 'Purchase order created' 
    })
  } catch (error) {
    console.error('PO error:', error)
    return NextResponse.json(
      { message: 'Failed to create PO' },
      { status: 500 }
    )
  }
}
