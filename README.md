# Microsoft Auth Project (NestJS 11 + Next.js 15)

Este proyecto implementa un sistema de login con Microsoft utilizando una arquitectura limpia y los últimos frameworks.

## Estructura del Proyecto

- `backend/`: API construida con NestJS 11 siguiendo principios SOLID.
- `frontend/`: Aplicación cliente construida con Next.js 15 y Shadcn UI.

## Requisitos Previos

1. Tener una aplicación registrada en **Azure Portal (Entra ID)**.
2. Configurar la URL de redirección en Azure: `http://localhost:3001/auth/microsoft/callback`
3. Copiar las credenciales (Client ID y Client Secret).

## Configuración

### Backend

1. Entra a la carpeta `backend`.
2. Edita el archivo `.env` con tus credenciales:
   ```env
   MICROSOFT_CLIENT_ID=TU_CLIENT_ID
   MICROSOFT_CLIENT_SECRET=TU_CLIENT_SECRET
   MICROSOFT_CALLBACK_URL=http://localhost:3001/auth/microsoft/callback
   JWT_SECRET=UNA_CLAVE_SECRETA
   FRONTEND_URL=http://localhost:3000
   ```
3. Ejecuta `npm install` (ya se ejecutó durante la creación).
4. Inicia el servidor: `npm run start:dev`.

### Frontend

1. Entra a la carpeta `frontend`.
2. El archivo `.env.local` ya apunta a `http://localhost:3001`.
3. Inicia la aplicación: `npm run dev`.

## Características

- **Arquitectura Limpia**: Separación de capas (Domain, Application, Infrastructure).
- **SOLID**: Uso de interfaces y servicios desacoplados.
- **Seguridad**: Autenticación vía Microsoft OAuth y sesiones protegidas con JWT.
- **Diseño Premium**: Shadcn UI, Tailwind CSS y Framer Motion.
