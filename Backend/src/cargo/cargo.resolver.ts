import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { CargoService } from './cargo.service';
import { Cargo } from './entities/cargo.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Resolver(() => Cargo)
export class CargoResolver {
  constructor(private readonly service: CargoService) {}

  @Mutation(() => Cargo)
  async createCargo(@Args('data') data: CreateCargoDto) {
    const c = await this.service.create(data);
    return this.service.findOne(c.id);
  }

  @Query(() => [Cargo])
cargos() {
  return this.service.findAll();
}

@Query(() => [Cargo])
cargosActivos() {
  return this.service.findActivos();
}


  @Query(() => Cargo)
  cargo(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Cargo)
  async updateCargo(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateCargoDto,
  ) {
    await this.service.update(id, data);
    return this.service.findOne(id);
  }

  @Mutation(() => Boolean)
  async removeCargo(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return true;
  }

  @ResolveField(() => [Trabajador], { nullable: true })
  trabajadores(@Parent() cargo: Cargo) {
    return this.service.getTrabajadores(cargo.id);
  }
}
