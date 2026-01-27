import { InputType, Field, PartialType, Int } from '@nestjs/graphql';
import { CreateAftDto } from './create-aft.dto';
import { IsOptional, IsBoolean, IsString, IsInt } from 'class-validator';

@InputType()
export class UpdateAftDto extends PartialType(CreateAftDto, InputType) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rotulo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombre?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  subclasificacionId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  areaId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}