import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsBoolean, IsString, IsOptional } from 'class-validator';

@InputType()
export class RegistrarConteoInput {
  
  @Field(() => Int)
  @IsInt()
  asignacionMensualId: number;

  @Field(() => Int)
  @IsInt()
  aftId: number;

  @Field()
  @IsBoolean()
  encontrado: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ubicacionEncontrada?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  estadoEncontrado?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  areaEncontrada?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comentarios?: string;
}

@InputType()
export class ActualizarRegistroConteoInput {
  
  @Field(() => Int)
  @IsInt()
  registroId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  encontrado?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ubicacionEncontrada?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  estadoEncontrado?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  areaEncontrada?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comentarios?: string;
}

@InputType()
export class RevisarRegistroInput {
  
  @Field(() => Int)
  @IsInt()
  registroId: number;

  @Field()
  @IsBoolean()
  aprobado: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comentariosRevision?: string;
}

@InputType()
export class AplicarCorreccionInput {
  
  @Field(() => Int)
  @IsInt()
  registroId: number;

  @Field(() => [String])
  camposCorregidos: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notas?: string;
}