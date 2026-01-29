import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConteoConfig, ConteoTipo } from './entities/conteo.entity';

@Injectable()
export class NotificationSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(ConteoConfig)
    private readonly conteoConfigRepository: Repository<ConteoConfig>,
  ) {}

  async onModuleInit() {
    await this.seedConteoConfig();
  }

  private async seedConteoConfig() {
    const count = await this.conteoConfigRepository.count();

    if (count > 0) {
      return;
    }

    const configs = [
      {
        tipo: ConteoTipo.MENSUAL,
        mes: 1,
        dia: 10,
        diasAviso: 7,
      },
      {
        tipo: ConteoTipo.ANUAL,
        mes: 12,
        dia: 31,
        diasAviso: 15,
      },
    ];

    await this.conteoConfigRepository.save(configs);
  }
}