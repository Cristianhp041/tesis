import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCargoDto } from './create-cargo.dto';

@InputType()
export class UpdateCargoDto extends PartialType(CreateCargoDto) {}
