import { User } from './user.entity';
import type { LoginDto, ChangePasswordDto } from '../application/dtos/login.dto';

export interface IAuthService {
    // Método de Microsoft (opcional - comentado)
    validateUser?(microsoftId: string, email: string, name: string): Promise<User>;
    
    // Métodos de login tradicional
    login(loginDto: LoginDto): Promise<{ token: string; debeCambiarPassword: boolean; usuario: any }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ success: boolean; message: string }>;
    
    // Método común
    generateJwt(user: User): string;
}
