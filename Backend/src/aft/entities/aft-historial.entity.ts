import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Aft } from './aft.entity';

@ObjectType()
@Entity()
export class AftHistorial {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  descripcion: string;

  @Field()
  @CreateDateColumn()
  fecha: Date;

  @Field(() => Int)
  @Column()
  aftId: number;

  @Field(() => Aft)
  @ManyToOne(() => Aft, (aft) => aft.historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aftId' })
  aft: Aft;
}
