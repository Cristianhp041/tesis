import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

@InputType()
export class BulkMoveAftInput {
  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  aftIds: number[];

  @Field(() => Int)
  @IsInt()
  nuevaAreaId: number;
}
