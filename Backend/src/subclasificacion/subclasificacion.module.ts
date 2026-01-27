import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subclasificacion } from './entities/subclasificacion.entity';
import { SubclasificacionService } from './subclasificacion.service';
import { SubclasificacionResolver } from './subclasificacion.resolver';
import { AftModule } from '../aft/aft.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subclasificacion]),
    forwardRef(() => AftModule),
  ],
  providers: [SubclasificacionService, SubclasificacionResolver],
  exports: [SubclasificacionService, TypeOrmModule],
})
export class SubclasificacionModule {}