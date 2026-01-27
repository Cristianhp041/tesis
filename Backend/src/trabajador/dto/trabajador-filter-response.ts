import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Trabajador } from '../entities/trabajador.entity';

@ObjectType()
export class TrabajadorFilterResponse {
  @Field(() => [Trabajador])
  data: Trabajador[];

  @Field(() => Int)
  total: number;
}
