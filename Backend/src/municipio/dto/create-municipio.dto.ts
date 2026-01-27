import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

@InputType()
export class CreateMunicipioDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field(() => Int)
  @IsInt()
  provinciaId: number;
}
