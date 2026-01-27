import { Test, TestingModule } from '@nestjs/testing';
import { AftService } from './aft.service';

describe('AftService', () => {
  let service: AftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AftService],
    }).compile();

    service = module.get<AftService>(AftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
