import { PartialType } from '@nestjs/mapped-types';
import { CreateTrabajadorDto } from './create-trabajador.dto';
import { IsOptional, IsBoolean, IsString, IsInt, Matches, ValidateIf } from 'class-validator';

export class UpdateTrabajadorDto extends PartialType(CreateTrabajadorDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @Matches(/^[0-9]+$/, {
    message: 'El teléfono solo puede contener números',
  })
  telefono?: string | null;
}