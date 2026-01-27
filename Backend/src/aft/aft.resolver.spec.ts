import { Test, TestingModule } from '@nestjs/testing';
import { AftResolver } from './aft.resolver';

describe('AftResolver', () => {
  let resolver: AftResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AftResolver],
    }).compile();

    resolver = module.get<AftResolver>(AftResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
