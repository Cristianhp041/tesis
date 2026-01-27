import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Area } from '../../area/entities/area.entity';
import { AftHistorial } from './aft-historial.entity';
import { Subclasificacion } from '../../subclasificacion/entities/subclasificacion.entity';

@ObjectType()
@Entity()
@Unique(['rotulo'])
export class Aft {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  rotulo: string;

  @Field()
  @Column()
  nombre: string;

  @Field(() => Int)
  @Column()
  subclasificacionId: number;

  @Field(() => Subclasificacion)
  @ManyToOne(() => Subclasificacion, (s) => s.afts, { nullable: false })
  @JoinColumn({ name: 'subclasificacionId' })
  subclasificacion: Subclasificacion;

  @Field(() => Int)
  @Column()
  areaId: number;

  @Field(() => Area)
  @ManyToOne(() => Area, (area) => area.afts, { nullable: false })
  @JoinColumn({ name: 'areaId' })
  area: Area;


  @Field()
  @Column({ default: true })
  activo: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [AftHistorial], { nullable: true })
  @OneToMany(() => AftHistorial, (h) => h.aft)
  historial?: AftHistorial[];
}
