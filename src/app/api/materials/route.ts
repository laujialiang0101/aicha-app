import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, category, unit, packing_size, supplier_code, cost_myr
      FROM raw_materials 
      WHERE is_active = true 
      ORDER BY category, name
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json([])
  }
}
