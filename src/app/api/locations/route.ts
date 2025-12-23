import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT id, name, type, region 
      FROM locations 
      WHERE is_active = true 
      ORDER BY type, name
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json([])
  }
}
