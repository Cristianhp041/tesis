import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateTextDocumentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  evento?: string;
}