import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('MICROSOFT_CLIENT_ID')!,
            clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL')!,
            scope: ['user.read'],
            tenant: 'common', // Use 'common' for multi-tenant or your tenant ID
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any) => void) {
        const { id, displayName, emails } = profile;
        const email = emails && emails.length > 0 ? emails[0].value : null;

        try {
            const user = await this.authService.validateUser(id, email, displayName);
            done(null, user);
        } catch (error) {
            // Si el usuario no está autorizado, pasamos el error a Passport
            done(error, null);
        }
    }
}