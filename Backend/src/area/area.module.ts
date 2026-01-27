import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaService } from './area.service';
import { AreaResolver } from './area.resolver';
import { Area } from './entities/area.entity';
import { Aft } from '../aft/entities/aft.entity';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule,TypeOrmModule.forFeature([Area, Aft])],
  providers: [AreaService, AreaResolver],
  exports: [AreaService, TypeOrmModule],
})
export class AreaModule {}

