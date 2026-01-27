import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provincia } from './entities/provincia.entity';
import { ProvinciaService } from './provincia.service';
import { ProvinciaResolver } from './provincia.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Provincia])],
  providers: [ProvinciaService, ProvinciaResolver],
  exports: [ProvinciaService],
})
export class ProvinciaModule {}
