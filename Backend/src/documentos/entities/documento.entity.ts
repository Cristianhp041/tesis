import { Field, ID, ObjectType, Int, registerEnumType } from '@nestjs/graphql';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  UpdateDateColumn 
} from 'typeorm';

export enum DocumentType {
  MENSUAL = 'MENSUAL',
  ESPECIFICO = 'ESPECIFICO'
}

registerEnumType(DocumentType, {
  name: 'DocumentType',
});

@Entity('documents')
@ObjectType()
export class DocumentoEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  nombre: string;

  @Field()
  @Column()
  nombreOriginal: string;

  @Field(() => DocumentType)
  @Column({
    type: 'enum',
    enum: DocumentType
  })
  tipo: DocumentType;

  @Field()
  @Column()
  url: string;

  @Field(() => Int)
  @Column()
  tamano: number;

  @Field()
  @Column()
  extension: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  descripcion?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  mes?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  evento?: string;

  @Field()
  @Column()
  subidoPor: string;

  @Field({ nullable: true })
  @Column({ type: 'boolean', default: false })
  esTextoWeb: boolean;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  contenido?: string;

  @Field()
  @CreateDateColumn()
  fechaSubida: Date;

  @Field()
  @UpdateDateColumn()
  fechaActualizacion: Date;
}

@ObjectType()
export class DocumentStats {
  @Field(() => Int)
  mensuales: number;

  @Field(() => Int)
  especificos: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalSize: number;
}

@ObjectType()
export class DeleteDocumentResponse {
  @Field()
  message: string;
}