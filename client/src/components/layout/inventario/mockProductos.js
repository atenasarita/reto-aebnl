export const CATEGORIAS_INVENTARIO = [
  'Material de curación',
  'Medicamentos',
  'Equipo médico',
  'Consumibles',
]

const DETALLE_POR_CATEGORIA = {
  'Material de curación': [
    ['Gasas Estériles', 'MED-001', '3 pzs', '$ 10.00'],
    ['Vendas', 'MED-002', '12 pzs', '$ 20.00'],
    ['Alcohol isopropílico', 'MED-003', '8 pzs', '$ 45.00'],
  ],
  Medicamentos: [
    ['Paracetamol 500mg', 'MED-101', '24 cajas', '$ 85.00'],
    ['Ibuprofeno 400mg', 'MED-102', '18 cajas', '$ 72.00'],
    ['Amoxicilina', 'MED-103', '10 cajas', '$ 120.00'],
  ],
  'Equipo médico': [
    ['Termómetro digital', 'EQ-201', '5 pzs', '$ 120.00'],
    ['Tensiómetro', 'EQ-202', '3 pzs', '$ 450.00'],
    ['Estetoscopio', 'EQ-203', '2 pzs', '$ 890.00'],
  ],
  Consumibles: [
    ['Guantes nitrilo', 'CON-301', '100 cajas', '$ 35.00'],
    ['Cubrebocas', 'CON-302', '50 cajas', '$ 28.00'],
    ['Jeringas 10ml', 'CON-303', '200 pzs', '$ 15.00'],
  ],
}

function crearMockTresPorCategoria() {
  let id = 1
  const list = []
  for (const categoria of CATEGORIAS_INVENTARIO) {
    const filas = DETALLE_POR_CATEGORIA[categoria]
    for (const [nombre, clave, cantidad, precio] of filas) {
      list.push({
        id: String(id++),
        categoria,
        nombre,
        clave,
        cantidad,
        precio,
      })
    }
  }
  return list
}

export const MOCK_PRODUCTOS = crearMockTresPorCategoria()

export const MOCK_TOTAL_RESULTADOS = MOCK_PRODUCTOS.length
