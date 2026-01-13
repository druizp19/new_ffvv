import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
    getAuthenticateOptions(context: ExecutionContext) {
        return {
            prompt: 'select_account',
        };
    }
}