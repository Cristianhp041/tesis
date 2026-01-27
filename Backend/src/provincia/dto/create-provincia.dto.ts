import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateProvinciaDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
