import { InputType, PartialType } from '@nestjs/graphql';
import { CreateAreaDto } from './create-area.dto';

@InputType()
export class UpdateAreaDto extends PartialType(CreateAreaDto) {}

