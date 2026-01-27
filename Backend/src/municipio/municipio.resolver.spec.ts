import { Test, TestingModule } from '@nestjs/testing';
import { MunicipioResolver } from './municipio.resolver';

describe('MunicipioResolver', () => {
  let resolver: MunicipioResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MunicipioResolver],
    }).compile();

    resolver = module.get<MunicipioResolver>(MunicipioResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
