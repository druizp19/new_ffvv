# Configuración del Sistema de Correos

## 📧 Sistema Implementado

El sistema envía correos automáticos en los siguientes casos:

1. **Cuando un GERENTE crea una solicitud** → Se envía correo al ADMINISTRADOR
2. **Cuando un ADMIN aprueba una solicitud** → Se envía correo al GERENTE solicitante
3. **Cuando un ADMIN rechaza una solicitud** → Se envía correo al GERENTE solicitante

---

## 🔧 Configuración

### 1. Instalar Paquetes (YA HECHO)

```bash
cd backend
npm install @nestjs-modules/mailer nodemailer handlebars
npm install -D @types/nodemailer
```

### 2. Configurar Variables de Entorno

Edita el archivo `backend/.env` y configura las siguientes variables:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-correo@medifarma.com.pe
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_FROM=Sistema Configuración Mercado <noreply@medifarma.com.pe>
ADMIN_EMAIL=admin@medifarma.com.pe
```

---

## 📝 Configuración para Gmail

Si usas Gmail, necesitas crear una **Contraseña de Aplicación**:

### Pasos:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Selecciona "Correo" y "Otro (nombre personalizado)"
5. Escribe "Sistema Configuración Mercado"
6. Copia la contraseña generada (16 caracteres)
7. Pégala en `MAIL_PASSWORD` en el archivo `.env`

**Ejemplo:**
```env
MAIL_USER=sistemas@medifarma.com.pe
MAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## 📧 Configuración para Outlook/Office 365

Si usas Outlook corporativo:

```env
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USER=tu-correo@medifarma.com.pe
MAIL_PASSWORD=tu-contraseña-normal
MAIL_FROM=Sistema Configuración Mercado <noreply@medifarma.com.pe>
ADMIN_EMAIL=admin@medifarma.com.pe
```

---

## 🎨 Plantillas de Correo

El sistema incluye 3 plantillas HTML profesionales:

### 1. Nueva Solicitud (para Admin)
- Fondo morado/azul
- Información de la solicitud
- Botón para ver en el sistema
- Datos: tipo operación, solicitante, mercado, cantidad productos

### 2. Solicitud Aprobada (para Gerente)
- Fondo verde
- Badge de "APROBADA"
- Información de quién aprobó
- Botón para ver productos

### 3. Solicitud Rechazada (para Gerente)
- Fondo rojo
- Badge de "RECHAZADA"
- Comentario del administrador (si existe)
- Información de quién rechazó

---

## 🧪 Probar el Sistema

### 1. Crear una solicitud como GERENTE:

```bash
# Login como gerente
POST /auth/login
{
  "login": "gerente_usuario",
  "contraseña": "123"
}

# Crear solicitud
POST /products/assign-market
{
  "productos": [...],
  "mercado": "TEST",
  "franquicia": "TEST"
}
```

**Resultado:** El admin recibirá un correo

### 2. Aprobar solicitud como ADMIN:

```bash
# Login como admin
POST /auth/login
{
  "login": "admin_usuario",
  "contraseña": "123"
}

# Aprobar
POST /solicitudes/1/aprobar
{
  "comentario": "Aprobado correctamente"
}
```

**Resultado:** El gerente recibirá un correo de aprobación

---

## 🔍 Verificar Logs

Los correos generan logs en la consola:

```
📧 [Email] Correo enviado: <message-id>
✅ [CrearSolicitud] Email enviado al administrador
✅ [AprobarSolicitud] Email enviado al solicitante
```

Si hay error:
```
❌ [Email] Error al enviar correo: <error>
```

---

## ⚠️ Troubleshooting

### Error: "Invalid login"
- Verifica que `MAIL_USER` y `MAIL_PASSWORD` sean correctos
- Si usas Gmail, asegúrate de usar contraseña de aplicación
- Verifica que la verificación en 2 pasos esté activada

### Error: "Connection timeout"
- Verifica que `MAIL_HOST` y `MAIL_PORT` sean correctos
- Verifica que el firewall no bloquee el puerto 587
- Intenta con puerto 465 (SSL) cambiando `secure: true` en el código

### No llegan los correos
- Verifica la carpeta de SPAM
- Verifica que `ADMIN_EMAIL` esté configurado correctamente
- Revisa los logs de la consola para ver si hay errores

### Correos llegan a SPAM
- Configura SPF, DKIM y DMARC en tu dominio
- Usa un servidor SMTP corporativo en lugar de Gmail
- Contacta al administrador de correo de Medifarma

---

## 🚀 Producción

Para producción, se recomienda:

1. **Usar servidor SMTP corporativo** de Medifarma
2. **Configurar dominio verificado** para evitar SPAM
3. **Usar cola de correos** (opcional) con Bull/Redis para mejor rendimiento
4. **Monitorear envíos** con logs y alertas

### Ejemplo configuración producción:

```env
MAIL_HOST=smtp.medifarma.com.pe
MAIL_PORT=587
MAIL_USER=noreply@medifarma.com.pe
MAIL_PASSWORD=contraseña-segura
MAIL_FROM=Sistema Configuración Mercado <noreply@medifarma.com.pe>
ADMIN_EMAIL=admin@medifarma.com.pe,admin2@medifarma.com.pe
```

**Nota:** `ADMIN_EMAIL` puede ser múltiples correos separados por comas.

---

## 📊 Estadísticas

El sistema NO guarda estadísticas de correos enviados. Si necesitas esto:

1. Implementar tabla `email_logs` en la base de datos
2. Guardar: destinatario, asunto, fecha, estado (enviado/error)
3. Crear endpoint para consultar logs

---

## 🎯 Próximas Mejoras (Opcional)

- [ ] Cola de correos con Bull/Redis
- [ ] Reintentos automáticos si falla el envío
- [ ] Plantillas personalizables desde base de datos
- [ ] Notificaciones por WhatsApp (Twilio)
- [ ] Dashboard de estadísticas de correos
- [ ] Adjuntar PDF con detalles de la solicitud

---

## 📞 Soporte

Si tienes problemas con la configuración, contacta al equipo de desarrollo.
