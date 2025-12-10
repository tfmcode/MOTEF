// =====================================================
// TIPOS DE USUARIOS
// =====================================================

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: "cliente" | "admin";
  activo: boolean;
  email_verificado: boolean;
  fecha_registro: string;
  ultima_sesion?: string;
}

// Alias para compatibilidad
export type User = Usuario;

// =====================================================
// TIPOS DE PRODUCTOS
// =====================================================

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  descripcion_corta?: string;
  precio: number;
  precio_anterior?: number;
  stock: number;
  categoria_id: number;
  imagen_url?: string;
  imagenes_adicionales?: string[];
  sku: string;
  peso_gramos?: number;
  destacado: boolean;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  vistas: number;
  ventas: number;
  // Relaciones
  categoria?: Categoria;
}

// Vista completa con categoría
export interface ProductoCompleto extends Producto {
  categoria_nombre: string;
  categoria_slug: string;
  estado_stock: "sin_stock" | "stock_bajo" | "disponible";
  porcentaje_descuento: number;
}

// =====================================================
// TIPOS DE CATEGORÍAS
// =====================================================

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  parent_id?: number;
  imagen_url?: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Relaciones
  subcategorias?: Categoria[];
  productos?: Producto[];
  productos_count?: number;
}

// =====================================================
// TIPOS DE CARRITO
// =====================================================

export interface ItemCarrito {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  fecha_agregado: string;
  fecha_actualizacion: string;
  // Relaciones
  producto?: Producto;
}

export interface CarritoCompleto {
  items: ItemCarritoCompleto[];
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  cantidad_items: number;
}

export interface ItemCarritoCompleto extends ItemCarrito {
  producto: Producto;
  subtotal: number;
}

// =====================================================
// TIPOS DE DIRECCIONES
// =====================================================

export interface Direccion {
  id: number;
  usuario_id: number;
  nombre_contacto: string;
  telefono_contacto: string;
  direccion: string;
  numero?: string;
  piso?: string;
  depto?: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  pais: string;
  referencias?: string;
  es_principal: boolean;
  activo: boolean;
  fecha_creacion: string;
}

// =====================================================
// TIPOS DE PEDIDOS
// =====================================================

export type EstadoPedido =
  | "pendiente"
  | "procesando"
  | "enviado"
  | "entregado"
  | "cancelado";

export interface Pedido {
  id: number;
  numero_pedido: string;
  usuario_id: number;
  direccion_id: number;
  fecha_pedido: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  estado: EstadoPedido;
  fecha_procesado?: string;
  fecha_enviado?: string;
  fecha_entregado?: string;
  metodo_pago: string;
  mercadopago_preference_id?: string;
  mercadopago_payment_id?: string;
  mercadopago_status?: string;
  fecha_pago?: string;
  notas?: string;
  notas_admin?: string;
  codigo_descuento?: string;
  // Relaciones
  usuario?: Usuario;
  direccion?: Direccion;
  items?: DetallePedido[];
  pago?: Pago;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  nombre_producto: string;
  sku: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  // Relaciones
  producto?: Producto;
}

export interface PedidoCompleto
  extends Omit<Pedido, "usuario" | "direccion" | "items"> {
  usuario: Pick<
    Usuario,
    | "id"
    | "nombre"
    | "apellido"
    | "email"
    | "rol"
    | "activo"
    | "email_verificado"
    | "fecha_registro"
  >;
  direccion: Direccion;
  items: DetallePedido[];
  cantidad_items: number;
  cantidad_productos: number;
}

// =====================================================
// TIPOS DE PAGOS
// =====================================================

export interface Pago {
  id: number;
  pedido_id: number;
  mercadopago_payment_id?: string;
  mercadopago_preference_id?: string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  net_amount?: number;
  fee_amount?: number;
  payer_email?: string;
  payer_id?: string;
  external_reference?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_aprobado?: string;
  raw_response?: Record<string, unknown>;
}

// =====================================================
// TIPOS DE RESPUESTA API
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =====================================================
// TIPOS DE FILTROS
// =====================================================

export interface ProductoFiltros {
  categoria?: string;
  busqueda?: string;
  precio_min?: number;
  precio_max?: number;
  destacado?: boolean;
  ordenar?:
    | "precio_asc"
    | "precio_desc"
    | "nombre_asc"
    | "nombre_desc"
    | "reciente"
    | "popular";
  pagina?: number;
  limite?: number;
}

export interface PedidoFiltros {
  estado?: EstadoPedido;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_id?: number;
  pagina?: number;
  limite?: number;
}

// =====================================================
// TIPOS DE FORMULARIOS
// =====================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegistroForm {
  email: string;
  password: string;
  confirmar_password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
}

export interface DireccionForm {
  nombre_contacto: string;
  telefono_contacto: string;
  direccion: string;
  numero?: string;
  piso?: string;
  depto?: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  referencias?: string;
  es_principal: boolean;
}

export interface CheckoutForm {
  direccion_id: number;
  metodo_pago: string;
  notas?: string;
}

// =====================================================
// TIPOS DE ESTADÍSTICAS (para admin)
// =====================================================

export interface EstadisticasVentas {
  ventas_hoy: number;
  ventas_mes: number;
  ventas_total: number;
  pedidos_pendientes: number;
  pedidos_procesando: number;
  productos_bajo_stock: number;
  usuarios_nuevos_mes: number;
}

export interface ProductoMasVendido {
  producto_id: number;
  nombre: string;
  slug: string;
  imagen_url?: string;
  total_vendido: number;
  ingresos_totales: number;
  pedidos_count: number;
}

// =====================================================
// TIPOS DE MERCADO PAGO
// =====================================================

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export interface MercadoPagoNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

// =====================================================
// TIPOS DE CONFIGURACIÓN
// =====================================================

export interface ConfiguracionEnvio {
  envio_gratis_threshold: number;
  costo_envio_default: number;
  envio_habilitado: boolean;
}

export interface ConfiguracionPagos {
  mp_public_key: string;
  mp_sandbox_mode: boolean;
}

// =====================================================
// LEGACY - Mantener para compatibilidad temporal
// =====================================================
