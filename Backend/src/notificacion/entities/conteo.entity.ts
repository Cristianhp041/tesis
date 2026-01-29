import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ConteoTipo {
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

@ObjectType()
@Entity('conteo_config')
export class ConteoConfig {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({
    type: 'enum',
    enum: ConteoTipo,
  })
  tipo: ConteoTipo;

  @Field(() => Int)
  @Column()
  mes: number; // 1-12

  @Field(() => Int)
  @Column()
  dia: number; // 1-31

  @Field(() => Int)
  @Column({ default: 7 })
  diasAviso: number; // Cuántos días antes avisar
}