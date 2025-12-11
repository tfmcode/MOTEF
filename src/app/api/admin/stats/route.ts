import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createApiHandler } from "@/lib/security/apiValidation";
import { apiRateLimit } from "@/lib/security/rateLimit";

export const GET = createApiHandler(
  {
    requireAuth: true,
    allowedRoles: ["admin"],
    rateLimit: apiRateLimit,
    allowedMethods: ["GET"],
  },
  async () => {
    try {
      const productosQuery = `
        SELECT 
          COUNT(*) as total_productos,
          COUNT(*) FILTER (WHERE activo = true) as productos_activos,
          COUNT(*) FILTER (WHERE destacado = true) as productos_destacados,
          COUNT(*) FILTER (WHERE stock = 0) as productos_sin_stock,
          COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5) as productos_stock_bajo,
          SUM(stock) as stock_total
        FROM producto;
      `;

      const pedidosQuery = `
        SELECT 
          COUNT(*) as total_pedidos,
          COUNT(*) FILTER (WHERE estado = 'pendiente') as pedidos_pendientes,
          COUNT(*) FILTER (WHERE estado = 'procesando') as pedidos_procesando,
          COUNT(*) FILTER (WHERE estado = 'enviado') as pedidos_enviados,
          COUNT(*) FILTER (WHERE estado = 'entregado') as pedidos_entregados,
          COUNT(*) FILTER (WHERE fecha_pedido >= CURRENT_DATE) as pedidos_hoy,
          COUNT(*) FILTER (WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '7 days') as pedidos_semana,
          COUNT(*) FILTER (WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '30 days') as pedidos_mes,
          SUM(total) FILTER (WHERE estado != 'cancelado') as ingresos_total,
          SUM(total) FILTER (WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '30 days' AND estado != 'cancelado') as ingresos_mes
        FROM pedido;
      `;

      const usuariosQuery = `
        SELECT 
          COUNT(*) as total_usuarios,
          COUNT(*) FILTER (WHERE rol = 'admin') as total_admins,
          COUNT(*) FILTER (WHERE rol = 'cliente') as total_clientes,
          COUNT(*) FILTER (WHERE fecha_registro >= CURRENT_DATE - INTERVAL '30 days') as usuarios_mes,
          COUNT(*) FILTER (WHERE activo = true) as usuarios_activos
        FROM usuario;
      `;

      const topProductosQuery = `
        SELECT 
          p.id,
          p.nombre,
          p.slug,
          p.imagen_url,
          COUNT(dp.id) as veces_vendido,
          SUM(dp.cantidad) as unidades_vendidas,
          SUM(dp.subtotal) as ingresos_totales
        FROM producto p
        LEFT JOIN detalle_pedido dp ON p.id = dp.producto_id
        GROUP BY p.id, p.nombre, p.slug, p.imagen_url
        ORDER BY unidades_vendidas DESC NULLS LAST
        LIMIT 5;
      `;

      const [productos, pedidos, usuarios, topProductos] = await Promise.all([
        pool.query(productosQuery),
        pool.query(pedidosQuery),
        pool.query(usuariosQuery),
        pool.query(topProductosQuery),
      ]);

      const stats = {
        total_productos: parseInt(productos.rows[0].total_productos) || 0,
        productos_activos: parseInt(productos.rows[0].productos_activos) || 0,
        productos_destacados:
          parseInt(productos.rows[0].productos_destacados) || 0,
        productos_sin_stock:
          parseInt(productos.rows[0].productos_sin_stock) || 0,
        productos_stock_bajo:
          parseInt(productos.rows[0].productos_stock_bajo) || 0,
        stock_total: parseInt(productos.rows[0].stock_total) || 0,
        total_pedidos: parseInt(pedidos.rows[0].total_pedidos) || 0,
        pedidos_pendientes: parseInt(pedidos.rows[0].pedidos_pendientes) || 0,
        pedidos_procesando: parseInt(pedidos.rows[0].pedidos_procesando) || 0,
        pedidos_enviados: parseInt(pedidos.rows[0].pedidos_enviados) || 0,
        pedidos_entregados: parseInt(pedidos.rows[0].pedidos_entregados) || 0,
        pedidos_hoy: parseInt(pedidos.rows[0].pedidos_hoy) || 0,
        pedidos_semana: parseInt(pedidos.rows[0].pedidos_semana) || 0,
        pedidos_mes: parseInt(pedidos.rows[0].pedidos_mes) || 0,
        ingresos_total: parseFloat(pedidos.rows[0].ingresos_total) || 0,
        ingresos_mes: parseFloat(pedidos.rows[0].ingresos_mes) || 0,
        total_usuarios: parseInt(usuarios.rows[0].total_usuarios) || 0,
        total_admins: parseInt(usuarios.rows[0].total_admins) || 0,
        total_clientes: parseInt(usuarios.rows[0].total_clientes) || 0,
        usuarios_mes: parseInt(usuarios.rows[0].usuarios_mes) || 0,
        usuarios_activos: parseInt(usuarios.rows[0].usuarios_activos) || 0,
        top_productos: topProductos.rows.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          slug: p.slug,
          imagen_url: p.imagen_url,
          veces_vendido: parseInt(p.veces_vendido) || 0,
          unidades_vendidas: parseInt(p.unidades_vendidas) || 0,
          ingresos_totales: parseFloat(p.ingresos_totales) || 0,
        })),
        last_updated: new Date().toISOString(),
      };

      return NextResponse.json(stats);
    } catch (error) {
      console.error("❌ Error al obtener estadísticas:", error);
      return NextResponse.json(
        { message: "Error al obtener estadísticas" },
        { status: 500 }
      );
    }
  }
);
