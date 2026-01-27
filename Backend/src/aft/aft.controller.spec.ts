import { Test, TestingModule } from '@nestjs/testing';
import { AftController } from './aft.controller';
import { AftService } from './aft.service';

describe('AftController', () => {
  let controller: AftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AftController],
      providers: [AftService],
    }).compile();

    controller = module.get<AftController>(AftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
