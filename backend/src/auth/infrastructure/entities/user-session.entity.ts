import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'USER_SESSIONS', schema: 'ODS' })
export class UserSessionEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'token', type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ name: 'expires_at', type: 'datetime2' })
  expiresAt: Date;
}
