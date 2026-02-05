import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Resolver(() => User)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  
  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  me(@Context() context: { req: { user: { sub: number } } }) {
    const userId = context.req.user.sub;
    return this.userService.findProfile(userId);
  }

  @Query(() => [User])
  @Roles(UserRole.ADMIN)
  users(
    @Args('active', { nullable: true })
    active?: 'true' | 'false' | 'all',
  ) {
    return this.userService.findAll(active);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  createUser(@Args('data') data: CreateUserInput) {
    return this.userService.create(data);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateUserInput,
  ) {
    return this.userService.update(id, data);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  activateUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.activate(id);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  deactivateUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.deactivate(id);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  approveUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.userService.approveUser(userId);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  rejectUser(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    return this.userService.rejectUser(userId, reason);
  }
}