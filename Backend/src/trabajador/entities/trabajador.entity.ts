import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { Municipio } from '../../municipio/entities/municipio.entity';
import { Provincia } from '../../provincia/entities/provincia.entity';

@ObjectType()
@Entity()
export class Trabajador {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  nombre: string;

  @Field()
  @Column()
  apellidos: string;

  @Field()
  @Column({ unique: true })
  expediente: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  telefono: string | null;

  @Field(() => Int)
  @Column()
  cargoId: number;

  @Field(() => Cargo)
  @ManyToOne(() => Cargo, (cargo) => cargo.trabajadores)
  @JoinColumn({ name: 'cargoId' })
  cargo: Cargo;

  @Field(() => Int)
  @Column()
  municipioId: number;

  @Field(() => Municipio)
  @ManyToOne(() => Municipio)
  @JoinColumn({ name: 'municipioId' })
  municipio: Municipio;

  @Field(() => Int)
  @Column()
  provinciaId: number;

  @Field(() => Provincia)
  @ManyToOne(() => Provincia)
  @JoinColumn({ name: 'provinciaId' })
  provincia: Provincia;

  @Field()
  @Column({ default: true })
  activo: boolean;
}