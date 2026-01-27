import { Test, TestingModule } from '@nestjs/testing';
import { TrabajadorController } from './trabajador.controller';
import { TrabajadorService } from './trabajador.service';

describe('TrabajadorController', () => {
  let controller: TrabajadorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrabajadorController],
      providers: [TrabajadorService],
    }).compile();

    controller = module.get<TrabajadorController>(TrabajadorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
