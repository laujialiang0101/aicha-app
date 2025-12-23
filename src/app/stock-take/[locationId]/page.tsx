import { query } from '@/lib/db'
import StockTakeForm from './StockTakeForm'

async function getLocationAndItems(locationId: string) {
  try {
    // Get location info
    const locResult = await query(
      'SELECT id, name, type FROM locations WHERE id = $1',
      [locationId]
    )
    const location = locResult.rows[0]

    // Get items with unit conversions
    const itemsResult = await query(`
      SELECT 
        rm.id,
        rm.name,
        rm.category,
        rm.unit as base_unit,
        COALESCE(uc.carton_name, 'ctn') as carton_name,
        COALESCE(uc.pack_name, 'pack') as pack_name,
        COALESCE(uc.units_per_pack, 1) as units_per_pack,
        COALESCE(uc.packs_per_carton, 1) as packs_per_carton,
        COALESCE(uc.units_per_carton, 1) as units_per_carton
      FROM raw_materials rm
      LEFT JOIN unit_conversions uc ON rm.id = uc.raw_material_id
      WHERE rm.is_active = true
      ORDER BY rm.category, rm.name
    `)

    // Group by category
    const itemsByCategory: Record<string, any[]> = {}
    itemsResult.rows.forEach((item: any) => {
      const cat = item.category || 'Other'
      if (!itemsByCategory[cat]) {
        itemsByCategory[cat] = []
      }
      itemsByCategory[cat].push(item)
    })

    return { location, itemsByCategory }
  } catch (error) {
    console.error('Error:', error)
    return { location: null, itemsByCategory: {} }
  }
}

export default async function StockTakeLocationPage({
  params
}: {
  params: { locationId: string }
}) {
  const { location, itemsByCategory } = await getLocationAndItems(params.locationId)

  if (!location) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Location not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📋 Stock Take</h1>
          <p className="text-gray-600">{location.name}</p>
        </div>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {new Date().toLocaleDateString('en-MY')}
        </span>
      </div>

      {/* Stock Take Form */}
      <StockTakeForm 
        locationId={location.id} 
        locationName={location.name}
        itemsByCategory={itemsByCategory} 
      />
    </div>
  )
}
