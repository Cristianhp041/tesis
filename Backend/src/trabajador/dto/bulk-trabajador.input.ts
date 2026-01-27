import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, ArrayMinSize } from 'class-validator';

@InputType()
export class BulkTrabajadorInput {
  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un trabajador' })
  trabajadorIds: number[];
}