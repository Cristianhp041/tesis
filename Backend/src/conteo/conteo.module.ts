import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanConteoAnual } from './entities/plan-conteo-anual.entity';
import { AsignacionMensual } from './entities/asignacion-mensual.entity';
import { RegistroConteo } from './entities/registro-conteo.entity';

import { AlgoritmoDistribucionService } from './services/algoritmo-distribucion.service';
import { PlanConteoService } from './services/plan-conteo.service';
import { AsignacionMensualService } from './services/asignacion-mensual.service';
import { RegistroConteoService } from './services/registro-conteo.service';

import { PlanConteoResolver } from './resolvers/plan-conteo.resolver';
import { AsignacionMensualResolver } from './resolvers/asignacion-mensual.resolver';
import { RegistroConteoResolver } from './resolvers/registro-conteo.resolver';
import { PlanConteoController } from './controller/plan-conteo.controller';

import { Aft } from '../aft/entities/aft.entity';
import { Area } from '../area/entities/area.entity';
import { Subclasificacion } from '../subclasificacion/entities/subclasificacion.entity';
import { User } from '../user/entities/user.entity';
import { AftModule } from '../aft/aft.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanConteoAnual,
      AsignacionMensual,
      RegistroConteo,
      Aft,
      Area,
      Subclasificacion,
      User,
    ]),
    forwardRef(() => AftModule),
  ],
  controllers: [PlanConteoController],
  providers: [
    AlgoritmoDistribucionService,
    PlanConteoService,
    AsignacionMensualService,
    RegistroConteoService,
    PlanConteoResolver,
    AsignacionMensualResolver,
    RegistroConteoResolver,
    {
      provide: 'CONTEO_SERVICE',
      useClass: PlanConteoService,
    },
  ],
  exports: [
    PlanConteoService,
    AsignacionMensualService,
    RegistroConteoService,
    AlgoritmoDistribucionService,
    'CONTEO_SERVICE',
  ],
})
export class ConteoAftModule {}