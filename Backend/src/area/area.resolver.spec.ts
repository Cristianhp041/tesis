import { Test, TestingModule } from '@nestjs/testing';
import { AreaResolver } from './area.resolver';

describe('AreaResolver', () => {
  let resolver: AreaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AreaResolver],
    }).compile();

    resolver = module.get<AreaResolver>(AreaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
