import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, IsBoolean, Matches, ValidateIf } from 'class-validator';

@InputType()
export class UpdateTrabajadorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  nombre?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'Los apellidos solo pueden contener letras',
  })
  apellidos?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  expediente?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cargoId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  provinciaId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  municipioId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @Matches(/^[0-9]+$/, {
    message: 'El teléfono solo puede contener números',
  })
  telefono?: string | null;
}