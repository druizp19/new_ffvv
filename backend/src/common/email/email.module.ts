import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { UsuarioEntity } from '../../auth/infrastructure/entities/usuario.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UsuarioEntity])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
