import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DocumentoEntity, DocumentStats, DeleteDocumentResponse } from './entities/documento.entity';
import { DocumentsService } from './documento.service';
import { FilterDocumentsInput } from './dto/create.dto';
import { CreateTextDocumentInput } from './dto/createtexdocumento.dto';
import { UpdateTextDocumentInput } from './dto/updatetexdocumento.dto';

@Resolver(() => DocumentoEntity)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Query(() => [DocumentoEntity])
  documents(
    @Args('filters', { nullable: true }) filters?: FilterDocumentsInput,
  ) {
    return this.documentsService.findAll(filters || {});
  }

  @Query(() => DocumentoEntity)
  document(@Args('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Mutation(() => DocumentoEntity)
  createTextDocument(@Args('input') input: CreateTextDocumentInput) {
    return this.documentsService.createTextDocument(input);
  }

  @Mutation(() => DocumentoEntity)
  updateTextDocument(
    @Args('id') id: string,
    @Args('input') input: UpdateTextDocumentInput
  ) {
    return this.documentsService.updateTextDocument(id, input);
  }

  @Mutation(() => DeleteDocumentResponse)
  deleteDocument(@Args('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Query(() => DocumentStats)
  documentStats() {
    return this.documentsService.getStats();
  }

  @Query(() => String)
  async downloadDocumentUrl(@Args('id') id: string) {
    const document = await this.documentsService.findOne(id);
    const filename = document.url.split('\\').pop()?.split('/').pop() || '';
    return `/uploads/documents/${filename}`;
  }
}