import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsInt, IsIn } from 'class-validator';

@InputType()
export class TrabajadorFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cargo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  municipio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  provincia?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cargoId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  municipioId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  provinciaId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  offset?: number;
}