export type Tipo_movimiento_inventario = 'entrada' | 'salida';
export type InventarioActivo = 0 | 1;

export interface Objeto_categoria {
    id_categoria: number;
    descripcion: string | null;
}
    
export interface Inventario {
    id_inventario: number;
    clave: string;
    nombre: string;
    id_categoria: number;
    unidad_medida: string;
    precio: number;
    cantidad: number;
    activo: InventarioActivo;
}

export interface Venta_inventario {
    id_venta_inventario: number;
    id_servicio_otorgado: number;
    id_inventario: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}


export interface Movimientos_inventario {
    id_movimiento: number;
    id_inventario: number;
    tipo_movimiento: Tipo_movimiento_inventario;
    cantidad: number;
    fecha: Date;
    cant_anterior: number;
    cant_nueva: number;
    id_servicio_otorgado: number | null;
    id_usuario: number;
    motivo: string;
}

// Funciones 

export interface CreateObjeto_categoriaInput {
    descripcion: string | null;
}

export interface CreateInventarioInput {
    clave: string;
    nombre: string;
    id_categoria: number;
    unidad_medida: string;
    precio: number;
    cantidad?: number;
    activo?: InventarioActivo;
}

export interface CreateVenta_inventarioInput {
    id_servicio_otorgado: number;
    id_inventario: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface CreateMovimientos_inventarioInput {
    id_inventario: number;  
    tipo_movimiento: Tipo_movimiento_inventario;
    cantidad: number;
    fecha: Date;
    cant_anterior: number;
    cant_nueva: number;
    id_servicio_otorgado: number | null;
    id_usuario: number;
    motivo: string;
}

export interface GetInventarioResponse {
    inventario: Inventario[];
}
