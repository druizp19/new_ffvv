import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { UsuarioEntity } from '../../auth/infrastructure/entities/usuario.entity';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 [Email] Correo enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ [Email] Error al enviar correo:', error);
      return false;
    }
  }

  async sendSolicitudCreada(
    adminEmail: string,
    solicitante: string,
    tipoOperacion: string,
    mercado: string,
    cantidadProductos: number,
    solicitudId: number,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7e4feb 0%, #0162ff 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #7e4feb; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #7e4feb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nueva Solicitud de Cambio</h1>
          </div>
          <div class="content">
            <p>Hola Administrador,</p>
            <p>Se ha creado una nueva solicitud que requiere tu aprobación:</p>
            
            <div class="info-box">
              <p><strong>📋 Tipo de Operación:</strong> ${tipoOperacion}</p>
              <p><strong>👤 Solicitante:</strong> ${solicitante}</p>
              <p><strong>🏷️ Mercado:</strong> ${mercado}</p>
              <p><strong>📦 Cantidad de Productos:</strong> ${cantidadProductos}</p>
              <p><strong>🆔 ID Solicitud:</strong> #${solicitudId}</p>
            </div>

            <p>Por favor, revisa y procesa esta solicitud en el sistema:</p>
            <a href="${frontendUrl}/dashboard/approvals" class="button">Ver Solicitud</a>

            <div class="footer">
              <p>Este es un correo automático del Sistema de Configuración de Mercado</p>
              <p>© ${new Date().getFullYear()} Medifarma S.A.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `Nueva Solicitud de ${tipoOperacion} - #${solicitudId}`,
      html,
    });
  }

  async sendSolicitudAprobada(
    gerenteEmail: string,
    gerenteNombre: string,
    tipoOperacion: string,
    mercado: string,
    cantidadProductos: number,
    solicitudId: number,
    aprobadoPor: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
          .success-badge { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Solicitud Aprobada</h1>
          </div>
          <div class="content">
            <p>Hola ${gerenteNombre},</p>
            <p>Tu solicitud ha sido <span class="success-badge">APROBADA</span> y los cambios han sido aplicados exitosamente.</p>
            
            <div class="info-box">
              <p><strong>📋 Tipo de Operación:</strong> ${tipoOperacion}</p>
              <p><strong>🏷️ Mercado:</strong> ${mercado}</p>
              <p><strong>📦 Cantidad de Productos:</strong> ${cantidadProductos}</p>
              <p><strong>🆔 ID Solicitud:</strong> #${solicitudId}</p>
              <p><strong>✅ Aprobado por:</strong> ${aprobadoPor}</p>
            </div>

            <p>Los cambios ya están reflejados en el sistema y puedes verificarlos en la base de productos.</p>
            <a href="${frontendUrl}/dashboard/products" class="button">Ver Productos</a>

            <div class="footer">
              <p>Este es un correo automático del Sistema de Configuración de Mercado</p>
              <p>© ${new Date().getFullYear()} Medifarma S.A.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: gerenteEmail,
      subject: `✅ Solicitud Aprobada - ${tipoOperacion} #${solicitudId}`,
      html,
    });
  }

  async sendSolicitudRechazada(
    gerenteEmail: string,
    gerenteNombre: string,
    tipoOperacion: string,
    mercado: string,
    solicitudId: number,
    rechazadoPor: string,
    comentario?: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
          .reject-badge { background: #ef4444; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .comment-box { background: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #ef4444; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Solicitud Rechazada</h1>
          </div>
          <div class="content">
            <p>Hola ${gerenteNombre},</p>
            <p>Tu solicitud ha sido <span class="reject-badge">RECHAZADA</span>.</p>
            
            <div class="info-box">
              <p><strong>📋 Tipo de Operación:</strong> ${tipoOperacion}</p>
              <p><strong>🏷️ Mercado:</strong> ${mercado}</p>
              <p><strong>🆔 ID Solicitud:</strong> #${solicitudId}</p>
              <p><strong>❌ Rechazado por:</strong> ${rechazadoPor}</p>
            </div>

            ${comentario ? `
              <div class="comment-box">
                <p><strong>💬 Comentario del Administrador:</strong></p>
                <p>${comentario}</p>
              </div>
            ` : ''}

            <p>Si tienes dudas sobre el rechazo, por favor contacta al administrador.</p>

            <div class="footer">
              <p>Este es un correo automático del Sistema de Configuración de Mercado</p>
              <p>© ${new Date().getFullYear()} Medifarma S.A.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: gerenteEmail,
      subject: `❌ Solicitud Rechazada - ${tipoOperacion} #${solicitudId}`,
      html,
    });
  }

  async sendCambioDirectoAdmin(
    adminEmail: string,
    adminNombre: string,
    tipoOperacion: string,
    mercado: string,
    cantidadProductos: number,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    
    // Obtener emails de todos los gerentes activos
    const gerentes = await this.usuarioRepository.query(`
      SELECT u.email, u.usuario
      FROM ODS.TAB_USUARIO u
      INNER JOIN ODS.TAB_ROL r ON u.idRol = r.idRol
      WHERE r.rol = 'GERENTE' AND u.idEstado = 2 AND u.email IS NOT NULL
    `);
    
    const gerentesEmails = gerentes.map((g: any) => g.email).filter(Boolean);
    
    if (gerentesEmails.length === 0) {
      console.log('⚠️ [Email] No hay gerentes activos para notificar');
      return true;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0162ff 0%, #7e4feb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #0162ff; margin: 20px 0; border-radius: 5px; }
          .admin-badge { background: #0162ff; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .button { display: inline-block; background: #0162ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ Cambio Ejecutado por Administrador</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>El administrador <strong>${adminNombre}</strong> ha realizado un cambio <span class="admin-badge">DIRECTO</span> en el sistema.</p>
            
            <div class="info-box">
              <p><strong>📋 Tipo de Operación:</strong> ${tipoOperacion}</p>
              <p><strong>👤 Ejecutado por:</strong> ${adminNombre} (${adminEmail})</p>
              <p><strong>🏷️ Mercado:</strong> ${mercado}</p>
              <p><strong>📦 Cantidad de Productos:</strong> ${cantidadProductos}</p>
              <p><strong>⏰ Fecha:</strong> ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}</p>
            </div>

            <p>Los cambios ya están aplicados en el sistema y puedes verificarlos en la base de productos.</p>
            <a href="${frontendUrl}/dashboard/products" class="button">Ver Productos</a>

            <div class="footer">
              <p>Este es un correo automático del Sistema de Configuración de Mercado</p>
              <p>© ${new Date().getFullYear()} Medifarma S.A.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`📧 [Email] Enviando notificación a ${gerentesEmails.length} gerente(s)`);
    return this.sendEmail({
      to: gerentesEmails,
      subject: `⚡ Cambio Directo Ejecutado - ${tipoOperacion}`,
      html,
    });
  }
}
