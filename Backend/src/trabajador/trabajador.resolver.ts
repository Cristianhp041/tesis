import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { TrabajadorService } from './trabajador.service';
import { Trabajador } from './entities/trabajador.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Municipio } from '../municipio/entities/municipio.entity';
import { Provincia } from '../provincia/entities/provincia.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { TrabajadorFilterInput } from './dto/trabajador-filter.input';
import { TrabajadorFilterResponse } from './dto/trabajador-filter-response';
import { UpdateTrabajadorInput } from './dto/update-trabajador.input';
import { BulkTrabajadorInput } from './dto/bulk-trabajador.input';

@Resolver(() => Trabajador)
export class TrabajadorResolver {
  constructor(private readonly service: TrabajadorService) {}

  @Mutation(() => Trabajador)
  async createTrabajador(@Args('data') data: CreateTrabajadorDto) {
    const t = await this.service.create(data);
    return this.service.findOne(t.id);
  }

  @Query(() => [Trabajador])
  trabajadores() {
    return this.service.findAll();
  }

  @Query(() => Trabajador)
  trabajador(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Query(() => TrabajadorFilterResponse)
  filterTrabajadores(
    @Args('filters', { type: () => TrabajadorFilterInput, nullable: true })
    filters: TrabajadorFilterInput,
  ) {
    return this.service.filter(filters || {});
  }

  @Mutation(() => Boolean)
  async removeTrabajador(
    @Args('id', { type: () => Int }) id: number,
  ) {
    await this.service.remove(id);
    return true;
  }

  @Mutation(() => Trabajador)
async updateTrabajador(
  @Args('id', { type: () => Int }) id: number,
  @Args('data') data: UpdateTrabajadorInput,
) {

  await this.service.update(id, data);
  return this.service.findOne(id);
}

  @Mutation(() => [Trabajador])
  async desactivarTrabajadoresMasivo(
    @Args('data') data: BulkTrabajadorInput,
  ) {
    return this.service.desactivarMasivo(data.trabajadorIds);
  }

  @ResolveField(() => Cargo)
  cargo(@Parent() t: Trabajador) {
    return this.service.getCargo(t.cargoId);
  }

  @ResolveField(() => Municipio)
  municipio(@Parent() t: Trabajador) {
    return this.service.getMunicipio(t.municipioId);
  }

  @ResolveField(() => Provincia)
  provincia(@Parent() t: Trabajador) {
    return this.service.getProvincia(t.provinciaId);
  }
}