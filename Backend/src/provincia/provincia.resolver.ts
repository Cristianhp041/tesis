import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { ProvinciaService } from './provincia.service';
import { Provincia } from './entities/provincia.entity';
import { Municipio } from '../municipio/entities/municipio.entity';
import { CreateProvinciaDto } from './dto/create-provincia.dto';
import { UpdateProvinciaDto } from './dto/update-provincia.dto';

@Resolver(() => Provincia)
export class ProvinciaResolver {
  constructor(private readonly service: ProvinciaService) {}

  @Query(() => [Provincia])
  provincias() {
    return this.service.findAll();
  }

  @Query(() => Provincia)
  provincia(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Provincia)
  async createProvincia(@Args('data') data: CreateProvinciaDto) {
    const created = await this.service.create(data);
    return this.service.findOne(created.id);
  }

  @Mutation(() => Provincia)
  async updateProvincia(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateProvinciaDto,
  ) {
    await this.service.update(id, data);
    return this.service.findOne(id);
  }

  @Mutation(() => Boolean)
  async removeProvincia(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return true;
  }

  @ResolveField(() => [Municipio], { nullable: true })
  municipios(@Parent() provincia: Provincia) {
    return this.service.getMunicipios(provincia.id);
  }
}
