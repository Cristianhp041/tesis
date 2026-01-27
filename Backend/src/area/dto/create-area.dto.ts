import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateAreaDto {
  @Field()
  nombre: string;

  @Field({ nullable: true })
  descripcion?: string;

  @Field({ nullable: true })
  activo?: boolean;
}

