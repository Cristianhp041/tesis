import { Module } from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { TrabajadorResolver } from './trabajador.resolver';
import { TrabajadorController } from './trabajador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador])],
  controllers: [TrabajadorController],
  providers: [TrabajadorService, TrabajadorResolver],
})
export class TrabajadorModule {}
