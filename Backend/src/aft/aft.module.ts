import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aft } from './entities/aft.entity';
import { AftHistorial } from './entities/aft-historial.entity';
import { AftService } from './aft.service';
import { AftResolver } from './aft.resolver';
import { AftController } from './aft.controller';

import { Area } from '../area/entities/area.entity';
import { AreaModule } from '../area/area.module';
import { SubclasificacionModule } from '../subclasificacion/subclasificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aft, AftHistorial, Area]),
    AreaModule,
    forwardRef(() => SubclasificacionModule),
  ],
  controllers: [AftController],
  providers: [AftService, AftResolver],
  exports: [AftService, TypeOrmModule],
})
export class AftModule {}