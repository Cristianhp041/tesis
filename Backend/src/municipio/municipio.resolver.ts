import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { MunicipioService } from './municipio.service';
import { ProvinciaService } from '../provincia/provincia.service';
import { Municipio } from './entities/municipio.entity';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';

@Resolver(() => Municipio)
export class MunicipioResolver {
  constructor(
    private readonly service: MunicipioService,
    private readonly provinciaService: ProvinciaService,
  ) {}

  @Mutation(() => Municipio)
  createMunicipio(@Args('data') data: CreateMunicipioDto) {
    return this.service.create(data);
  }

  @Query(() => [Municipio])
  municipios() {
    return this.service.findAll();
  }

  @Query(() => Municipio)
  municipio(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Municipio)
  updateMunicipio(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateMunicipioDto,
  ) {
    return this.service.update(id, data);
  }

  @Mutation(() => Boolean)
  async removeMunicipio(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return true;
  }

  @ResolveField()
  provincia(@Parent() municipio: Municipio) {
    return this.provinciaService.findOne(municipio.provinciaId);
  }
  @Query(() => [Municipio])
  municipiosByProvincia(
  @Args('provinciaId', { type: () => Int }) provinciaId: number,
  ) {
  return this.service.findByProvincia(provinciaId);
  }

}

