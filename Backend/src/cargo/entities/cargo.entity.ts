import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';

@ObjectType()
@Entity()
export class Cargo {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  nombre: string;

  @Field(() => [Trabajador], { nullable: true })
  @OneToMany(() => Trabajador, (trab) => trab.cargo, { nullable: true })
  trabajadores?: Trabajador[];
  
  @Field(() => Boolean)
@Column({ default: true })
activo: boolean;

}
