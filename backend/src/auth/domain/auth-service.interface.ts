import { User } from './user.entity';

export interface IAuthService {
    validateUser(microsoftId: string, email: string, name: string): Promise<User>;
    generateJwt(user: User): string;
}
