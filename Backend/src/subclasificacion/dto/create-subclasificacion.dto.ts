import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';

@InputType()
export class CreateSubclasificacionDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}