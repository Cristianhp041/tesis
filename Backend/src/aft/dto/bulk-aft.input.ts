import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

@InputType()
export class BulkAftInput {
  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  aftIds: number[];
}
