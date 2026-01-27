import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class AftFilterInput {
  @Field({ nullable: true })
  search?: string; 

  @Field({ nullable: true })
  area?: string; 

  @Field({ nullable: true })
  subclasificacion?: string;

  @Field({ nullable: true })
  activo?: boolean;

  @Field({ nullable: true })
  orderBy?: string; 

  @Field({ nullable: true })
  orderDir?: "ASC" | "DESC";

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}
