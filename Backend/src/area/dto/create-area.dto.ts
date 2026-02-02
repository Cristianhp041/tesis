import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateAreaDto {
  @Field()
  @IsString()
  nombre: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}