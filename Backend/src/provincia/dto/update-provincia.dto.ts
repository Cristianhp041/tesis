import { InputType, PartialType } from '@nestjs/graphql';
import { CreateProvinciaDto } from './create-provincia.dto';

@InputType()
export class UpdateProvinciaDto extends PartialType(CreateProvinciaDto) {}
