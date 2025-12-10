import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function enviarEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"motef E-commerce" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    return { success: false, error };
  }
}

// ============================================
// TEMPLATES PARA E-COMMERCE
// ============================================

/**
 * Email de bienvenida para nuevos clientes
 */
export function templateBienvenida(nombre: string, email: string) {
  const urlTienda =
    process.env.NEXT_PUBLIC_SITE_URL || "https://motef.com.ar";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">¡Bienvenido a motef! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hola, ${nombre}!</h2>
          <p>Tu cuenta fue creada exitosamente. Ya podés empezar a navegar nuestra tienda y realizar tus compras.</p>
          
          <p><strong>Datos de tu cuenta:</strong></p>
          <p>📧 Email: <strong>${email}</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlTienda}" class="button">Explorar Productos</a>
          </div>
          
          <p>Si tenés alguna consulta, no dudes en contactarnos.</p>
          
          <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de motef</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} motef - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bienvenido a motef!

Hola, ${nombre}!

Tu cuenta fue creada exitosamente. Ya podés empezar a navegar nuestra tienda y realizar tus compras.

Datos de tu cuenta:
Email: ${email}

Visitá nuestra tienda: ${urlTienda}

Saludos,
Equipo de motef
  `;

  return { html, text };
}

/**
 * Email de confirmación de pedido
 */
export function templateConfirmacionPedido(
  nombre: string,
  numeroPedido: string,
  total: number,
  items: Array<{ nombre: string; cantidad: number; precio: number }>
) {
  const urlPedido = `${process.env.NEXT_PUBLIC_SITE_URL}/cuenta/pedidos/${numeroPedido}`;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        item.nombre
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
        item.cantidad
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio.toLocaleString(
        "es-AR"
      )}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-box { background-color: white; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background-color: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">¡Pedido Confirmado! ✅</h1>
        </div>
        <div class="content">
          <h2>Gracias por tu compra, ${nombre}!</h2>
          <p>Tu pedido fue recibido y está siendo procesado.</p>
          
          <div class="order-box">
            <h3 style="margin-top: 0; color: #1c2e39;">📦 Pedido #${numeroPedido}</h3>
            
            <table>
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: center;">Cantidad</th>
                  <th style="padding: 10px; text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; font-weight: bold; text-align: right;">TOTAL:</td>
                  <td style="padding: 15px; font-weight: bold; text-align: right; font-size: 18px; color: #10b981;">$${total.toLocaleString(
                    "es-AR"
                  )}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="text-align: center;">
            <a href="${urlPedido}" class="button">Ver Detalle del Pedido</a>
          </div>
          
          <p>Te enviaremos una notificación cuando tu pedido sea despachado.</p>
          
          <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de motef</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} motef - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
¡Pedido Confirmado! ✅

Gracias por tu compra, ${nombre}!

Tu pedido fue recibido y está siendo procesado.

Pedido #${numeroPedido}

Productos:
${items
  .map(
    (item) =>
      `- ${item.nombre} x${item.cantidad} - $${item.precio.toLocaleString(
        "es-AR"
      )}`
  )
  .join("\n")}

TOTAL: $${total.toLocaleString("es-AR")}

Ver pedido: ${urlPedido}

Te enviaremos una notificación cuando tu pedido sea despachado.

Saludos,
Equipo de motef
  `;

  return { html, text };
}

/**
 * Email de pedido enviado
 */
export function templatePedidoEnviado(
  nombre: string,
  numeroPedido: string,
  codigoSeguimiento?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .tracking-box { background-color: #dbeafe; border: 2px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📦 Tu pedido está en camino!</h1>
        </div>
        <div class="content">
          <h2>Hola, ${nombre}!</h2>
          <p>¡Buenas noticias! Tu pedido <strong>#${numeroPedido}</strong> fue despachado y está en camino.</p>
          
          ${
            codigoSeguimiento
              ? `
          <div class="tracking-box">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">Código de seguimiento:</p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">${codigoSeguimiento}</p>
          </div>
          `
              : ""
          }
          
          <p>Te notificaremos cuando tu pedido sea entregado.</p>
          
          <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de motef</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} motef - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Tu pedido está en camino!

Hola, ${nombre}!

¡Buenas noticias! Tu pedido #${numeroPedido} fue despachado y está en camino.

${codigoSeguimiento ? `Código de seguimiento: ${codigoSeguimiento}` : ""}

Te notificaremos cuando tu pedido sea entregado.

Saludos,
Equipo de motef
  `;

  return { html, text };
}

/**
 * Email de recuperación de contraseña
 */
export function templateRecuperarPassword(nombre: string, token: string) {
  const urlReset = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #ef4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .alert { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔒 Recuperar Contraseña</h1>
        </div>
        <div class="content">
          <h2>Hola, ${nombre}!</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          
          <div style="text-align: center;">
            <a href="${urlReset}" class="button">Restablecer Contraseña</a>
          </div>
          
          <div class="alert">
            <strong>⚠️ Importante:</strong> Este enlace es válido por 1 hora. Si no solicitaste este cambio, podés ignorar este email.
          </div>
          
          <p>Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${urlReset}</p>
          
          <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de motef</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} motef - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Recuperar Contraseña

Hola, ${nombre}!

Recibimos una solicitud para restablecer tu contraseña.

Restablecé tu contraseña aquí: ${urlReset}

⚠️ Este enlace es válido por 1 hora. Si no solicitaste este cambio, podés ignorar este email.

Saludos,
Equipo de motef
  `;

  return { html, text };
}
