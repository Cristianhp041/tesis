import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';

@ObjectType()
@Entity()
export class Provincia {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  nombre: string;

  @Field(() => [Municipio], { nullable: true })
  @OneToMany(() => Municipio, (municipio) => municipio.provincia, {
    nullable: true,
  })
  municipios?: Municipio[];
}
