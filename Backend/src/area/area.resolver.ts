import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { AreaService } from './area.service';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Resolver(() => Area)
export class AreaResolver {
  constructor(private readonly service: AreaService) {}

  @Mutation(() => Area)
  async createArea(@Args('data') data: CreateAreaDto) {
    const area = await this.service.create(data);
    return this.service.findOne(area.id);
  }

  @Query(() => [Area])
  areas() {
    return this.service.findAll();
  }
  @Query(() => [Area])
  areasActivas() {
  return this.service.findActivas();
  }

  @Query(() => Area)
  area(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Area)
  async updateArea(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateAreaDto,
  ) {
    await this.service.update(id, data);
    return this.service.findOne(id);
  }

  @Mutation(() => Boolean)
  async removeArea(@Args('id', { type: () => Int }) id: number) {
    await this.service.remove(id);
    return true;
  }

  

}