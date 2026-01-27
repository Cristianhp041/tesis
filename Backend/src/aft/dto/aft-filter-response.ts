import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Aft } from "../entities/aft.entity";

@ObjectType()
export class AftFilterResponse {
  @Field(() => [Aft])
  data: Aft[];

  @Field(() => Int)
  total: number;
}
