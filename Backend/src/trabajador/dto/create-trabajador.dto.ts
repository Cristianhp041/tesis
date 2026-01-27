import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Matches,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateTrabajadorDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  nombre: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'Los apellidos solo pueden contener letras',
  })
  apellidos: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  expediente: string;

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

  @Field(() => Int)
  @IsInt()
  cargoId: number;

  @Field(() => Int)
  @IsInt()
  municipioId: number;

  @Field(() => Int)
  @IsInt()
  provinciaId: number;
}
