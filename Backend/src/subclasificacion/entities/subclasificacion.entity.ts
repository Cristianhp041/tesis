import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Aft } from '../../aft/entities/aft.entity';

@ObjectType()
@Entity()
export class Subclasificacion {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  nombre: string;

  @Field()
  @Column({ default: true })
  activo: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Aft], { nullable: true })
  @OneToMany(() => Aft, (aft) => aft.subclasificacion)
  afts?: Aft[];
}
