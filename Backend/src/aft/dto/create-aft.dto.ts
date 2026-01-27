import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

@InputType()
export class CreateAftDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  rotulo: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field(() => Int)
  @IsInt()
  subclasificacionId: number;

  @Field(() => Int)
  @IsInt()
  areaId: number;
}
