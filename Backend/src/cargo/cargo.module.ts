import { Module } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CargoResolver } from './cargo.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Cargo, Trabajador])],
  providers: [CargoService, CargoResolver],
})
export class CargoModule {}
