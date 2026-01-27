import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { SubclasificacionService } from './subclasificacion.service';
import { Subclasificacion } from './entities/subclasificacion.entity';
import { Aft } from '../aft/entities/aft.entity';
import { CreateSubclasificacionDto } from './dto/create-subclasificacion.dto';
import { UpdateSubclasificacionDto } from './dto/update-subclasificacion.dto';

@Resolver(() => Subclasificacion)
export class SubclasificacionResolver {
  constructor(private readonly service: SubclasificacionService) {}

  @Mutation(() => Subclasificacion)
  async createSubclasificacion(@Args('input') input: CreateSubclasificacionDto) {
    const sub = await this.service.create(input);
    return this.service.findOne(sub.id);
  }

  @Query(() => [Subclasificacion])
  subclasificaciones() {
    return this.service.findAll();
  }

  @Query(() => [Subclasificacion])
  subclasificacionesActivas() {
    return this.service.findActivas();
  }

  @Query(() => Subclasificacion)
  subclasificacion(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Subclasificacion)
  async updateSubclasificacion(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateSubclasificacionDto,
  ) {
    await this.service.update(id, data);
    return this.service.findOne(id);
  }

  @Mutation(() => Boolean)
  async removeSubclasificacion(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return true;
  }

  @ResolveField(() => [Aft], { nullable: true })
  afts(@Parent() subclasificacion: Subclasificacion) {
    return this.service.getAfts(subclasificacion.id);
  }
}