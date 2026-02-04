import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { DocumentType } from '../entities/documento.entity';

@InputType()
export class CreateTextDocumentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @Field(() => DocumentType)
  @IsNotEmpty()
  tipo: DocumentType;

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

  @Field()
  @IsString()
  @IsNotEmpty()
  subidoPor: string;
}