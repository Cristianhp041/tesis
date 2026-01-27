import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCargoDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field({ nullable: true })
  @IsOptional()
  activo?: boolean;
}
