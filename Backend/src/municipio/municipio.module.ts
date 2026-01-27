import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';
import { MunicipioService } from './municipio.service';
import { MunicipioResolver } from './municipio.resolver';
import { ProvinciaModule } from '../provincia/provincia.module';
import { Trabajador } from '../trabajador/entities/trabajador.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([Municipio, Trabajador]),
    ProvinciaModule,
  ], 
  providers: [MunicipioService, MunicipioResolver],
  exports: [MunicipioService],
})
export class MunicipioModule {}
