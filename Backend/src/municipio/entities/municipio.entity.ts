import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Provincia } from '../../provincia/entities/provincia.entity';

@ObjectType()
@Entity()
export class Municipio {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  nombre: string;

  @Field(() => Int)
  @Column()
  provinciaId: number;

  @Field(() => Provincia)
  @ManyToOne(() => Provincia, (provincia) => provincia.municipios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provinciaId' })
  provincia: Provincia;
}
