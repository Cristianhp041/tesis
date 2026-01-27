
import { ObjectType, Field, Int } from '@nestjs/graphql';
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, } from 'typeorm';
import { Aft } from '../../aft/entities/aft.entity';
@ObjectType()
@Entity()
export class Area {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  nombre: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  descripcion?: string;

  @Field(() => Boolean)
  @Column({ default: true })
  activo: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Aft], { nullable: true })
  @OneToMany(() => Aft, (aft) => aft.area)
  afts: Aft[];
}
