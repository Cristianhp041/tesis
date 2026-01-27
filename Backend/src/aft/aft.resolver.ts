import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AftService } from './aft.service';
import { Aft } from './entities/aft.entity';
import { CreateAftDto } from './dto/create-aft.dto';
import { UpdateAftDto } from './dto/update-aft.dto';
import { AftFilterInput } from './dto/aft-filter.input';
import { ObjectType, Field } from '@nestjs/graphql';
import { BulkAftInput } from './dto/bulk-aft.input';
import { BulkMoveAftInput } from './dto/bulk-move-aft.input';


@ObjectType()
export class AftFilterResponse {
  @Field(() => [Aft])
  data: Aft[];

  @Field(() => Int)
  total: number;
}

@Resolver(() => Aft)
export class AftResolver {
  constructor(private readonly service: AftService) {}

  @Mutation(() => Aft)
  createAft(@Args('data') data: CreateAftDto) {
    return this.service.create(data);
  }

  @Query(() => [Aft])
  afts(
  @Args('active', { nullable: true })
  active?: 'true' | 'false' | 'all',
  ) {
  return this.service.findAll(active ?? 'all');
  }

  @Query(() => Aft)
  aft(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id);
  }

  @Mutation(() => Aft)
  updateAft(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateAftDto,
  ) {
    return this.service.update(id, data);
  }

  @Mutation(() => Aft)
  moverAft(
    @Args('id', { type: () => Int }) id: number,
    @Args('nuevaAreaId', { type: () => Int }) nuevaAreaId: number,
  ) {
    return this.service.moverArea(id, nuevaAreaId);
  }

  @Mutation(() => Aft)
  desactivarAft(@Args('id', { type: () => Int }) id: number) {
    return this.service.desactivar(id);
  }

  @Query(() => AftFilterResponse)
  filterAfts(@Args('filters') filters: AftFilterInput) {
    return this.service.filter(filters);
  }

@Mutation(() => [Aft])
desactivarAftsMasivo(@Args('data') data: BulkAftInput) {
  return this.service.desactivarMasivo(data.aftIds);
}

@Mutation(() => [Aft])
moverAftsMasivo(@Args('data') data: BulkMoveAftInput) {
  return this.service.moverMasivo(data.aftIds, data.nuevaAreaId);
}

}
