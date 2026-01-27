import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../entities/documento.entity';

@InputType()
export class FilterDocumentsInput {
  @Field(() => DocumentType, { nullable: true })
  @IsOptional()
  tipo?: DocumentType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  busqueda?: string;
}