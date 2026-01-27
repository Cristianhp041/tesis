import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ImportTrabajadorRowDto {
  @IsString()
  @IsNotEmpty()
  Nombre: string;

  @IsString()
  @IsNotEmpty()
  Apellidos: string;

  @IsString()
  @IsNotEmpty()
  Expediente: string;

  @IsString()
  Telefono?: string;

  @IsString()
  @IsNotEmpty()
  Cargo: string;

  @IsString()
  @IsNotEmpty()
  Provincia: string;

  @IsString()
  @IsNotEmpty()
  Municipio: string;

  @IsString()
  Estado?: string;
}

export class ImportResultDto {
  @IsInt()
  exitosos: number;

  @IsInt()
  duplicados: number;

  @IsInt()
  errores: number;

  @IsString({ each: true })
  mensajes: string[];
}