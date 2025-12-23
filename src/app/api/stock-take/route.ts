import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, staffName, items } = body

    if (!locationId || !staffName || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert each stock take item
    for (const item of items) {
      // Calculate total units using the database function
      const totalResult = await query(
        'SELECT calculate_total_units($1, $2, $3, $4) as total',
        [item.id, item.cartons, item.packs, item.units]
      )
      const totalUnits = totalResult.rows[0]?.total || 0

      // Insert stock take record
      await query(`
        INSERT INTO stock_takes (
          location_id, 
          raw_material_id, 
          stock_take_date,
          carton_qty,
          pack_qty,
          unit_qty,
          actual_qty, 
          created_by
        ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7)
        ON CONFLICT (location_id, raw_material_id, stock_take_date) 
        DO UPDATE SET 
          carton_qty = EXCLUDED.carton_qty,
          pack_qty = EXCLUDED.pack_qty,
          unit_qty = EXCLUDED.unit_qty,
          actual_qty = EXCLUDED.actual_qty,
          created_by = EXCLUDED.created_by,
          created_at = NOW()
      `, [locationId, item.id, item.cartons, item.packs, item.units, totalUnits, staffName])
    }

    // Log the audit
    await query(`
      INSERT INTO audit_log (table_name, action, new_values, changed_by)
      VALUES ('stock_takes', 'INSERT', $1, $2)
    `, [JSON.stringify({ locationId, itemCount: items.length }), staffName])

    return NextResponse.json({ 
      success: true, 
      message: `Stock take saved: ${items.length} items` 
    })
  } catch (error) {
    console.error('Stock take error:', error)
    return NextResponse.json(
      { message: 'Failed to save stock take' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    const date = searchParams.get('date') || 'CURRENT_DATE'

    let queryStr = `
      SELECT 
        st.id,
        st.raw_material_id,
        rm.name as raw_material_name,
        rm.category,
        st.carton_qty,
        st.pack_qty,
        st.unit_qty,
        st.actual_qty,
        st.stock_take_date,
        st.created_by
      FROM stock_takes st
      JOIN raw_materials rm ON st.raw_material_id = rm.id
      WHERE st.stock_take_date = ${date === 'CURRENT_DATE' ? 'CURRENT_DATE' : '$2'}
    `
    const params: any[] = []

    if (locationId) {
      params.push(locationId)
      queryStr += ` AND st.location_id = $1`
    }

    if (date !== 'CURRENT_DATE') {
      params.push(date)
    }

    queryStr += ' ORDER BY rm.category, rm.name'

    const result = await query(queryStr, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching stock takes:', error)
    return NextResponse.json(
      { message: 'Failed to fetch stock takes' },
      { status: 500 }
    )
  }
}
