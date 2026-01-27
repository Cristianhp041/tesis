import { InputType, PartialType } from '@nestjs/graphql';
import { CreateMunicipioDto } from './create-municipio.dto';

@InputType()
export class UpdateMunicipioDto extends PartialType(CreateMunicipioDto) {}
