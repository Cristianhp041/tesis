import { Test, TestingModule } from '@nestjs/testing';
import { ProvinciaResolver } from './provincia.resolver';

describe('ProvinciaResolver', () => {
  let resolver: ProvinciaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvinciaResolver],
    }).compile();

    resolver = module.get<ProvinciaResolver>(ProvinciaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
