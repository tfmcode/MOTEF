import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, mensaje } = await request.json();

    // Validación básica
    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    // Insertar en la base de datos
    const query = `
      INSERT INTO consultas (nombre, email, mensaje, fecha_creacion)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
    `;

    const result = await pool.query(query, [nombre, email, mensaje]);

    return NextResponse.json(
      {
        success: true,
        message: "Consulta enviada exitosamente",
        data: { id: result.rows[0].id },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al guardar consulta:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la consulta" },
      { status: 500 }
    );
  }
}
