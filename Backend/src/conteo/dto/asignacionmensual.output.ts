import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ActivoAsignadoOutput {
  
  @Field(() => ID)
  id: string;

  @Field()
  codigo: string;

  @Field()
  descripcion: string;

  @Field({ nullable: true })
  ubicacion?: string;

  @Field({ nullable: true })
  estado?: string;

  @Field()
  areaNombre: string;

  @Field({ nullable: true })
  subclasificacionNombre?: string;

  @Field()
  yaContado: boolean;

  @Field() 
  activo: boolean;
}