import { Test, TestingModule } from '@nestjs/testing';
import { CargoResolver } from './cargo.resolver';

describe('CargoResolver', () => {
  let resolver: CargoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoResolver],
    }).compile();

    resolver = module.get<CargoResolver>(CargoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
