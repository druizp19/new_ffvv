import { Controller, Post, Body, UseGuards, Req, Get, Res, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto, ChangePasswordDto } from '../../application/dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthExceptionFilter } from '../filters/auth-exception.filter';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
        const userId = req.user.sub;
        return this.authService.changePassword(userId, changePasswordDto);
    }

    // Microsoft login endpoints (comentados - mantener por si se necesitan en el futuro)
    /*
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
            const errorMessage = encodeURIComponent('No tiene permisos para acceder a esta aplicación.');
            return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
        }
    }
    */
}
