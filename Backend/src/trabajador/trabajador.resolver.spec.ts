import { Test, TestingModule } from '@nestjs/testing';
import { TrabajadorResolver } from './trabajador.resolver';

describe('TrabajadorResolver', () => {
  let resolver: TrabajadorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrabajadorResolver],
    }).compile();

    resolver = module.get<TrabajadorResolver>(TrabajadorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
