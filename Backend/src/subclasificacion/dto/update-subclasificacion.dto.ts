import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class UpdateSubclasificacionDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombre?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}