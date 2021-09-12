import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  hashedPassword: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;
}
