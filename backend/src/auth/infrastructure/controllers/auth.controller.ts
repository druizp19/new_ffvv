import { Controller, Get, UseGuards, Req, Res, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { MicrosoftAuthGuard } from '../guards/microsoft-auth.guard';
import { AuthExceptionFilter } from '../filters/auth-exception.filter';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Get('microsoft')
    @UseGuards(MicrosoftAuthGuard)
    async microsoftAuth(@Req() req) {
        // Inicia el flujo de Microsoft con prompt de selección de cuenta
    }

    @Get('microsoft/callback')
    @UseGuards(AuthGuard('microsoft'))
    async microsoftAuthRedirect(@Req() req, @Res() res: Response) {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        try {
            const jwt = this.authService.generateJwt(req.user);
            return res.redirect(`${frontendUrl}/auth/callback?token=${jwt}`);
        } catch (error) {
            // Si el usuario no está autorizado, redirigir con error
            const errorMessage = encodeURIComponent('No tiene permisos para acceder a esta aplicación.');
            return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
        }
    }
}
