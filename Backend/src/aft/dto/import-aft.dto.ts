import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';

@InputType()
export class ImportAftRowDto {
  @Field()
  rotulo: string;

  @Field()
  nombre: string;

  @Field()
  area: string;

  @Field()
  subclasificacion: string;

  @Field()
  estado: string;
}

@ObjectType()
export class ImportResultDto {
  @Field(() => Int)
  exitosos: number;

  @Field(() => Int)
  duplicados: number;

  @Field(() => Int)
  errores: number;

  @Field(() => [String])
  mensajes: string[];
}