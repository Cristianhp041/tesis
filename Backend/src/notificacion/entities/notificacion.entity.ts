import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  CONTEO_MENSUAL_PROXIMO = 'CONTEO_MENSUAL_PROXIMO',
  CONTEO_MENSUAL_VENCIDO = 'CONTEO_MENSUAL_VENCIDO',
  GENERAL = 'GENERAL',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Field(() => NotificationType)
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  message: string;

  @Field()
  @Column({ default: false })
  read: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  readAt?: Date;
}