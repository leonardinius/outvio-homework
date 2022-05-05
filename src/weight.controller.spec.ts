import { Test, TestingModule } from '@nestjs/testing';
import { WeightController } from './weight.controller';

describe('WeightController', () => {
  let appController: WeightController;
  const id2params = (id) => {
    return { id: id };
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WeightController],
      providers: [],
    }).compile();

    appController = app.get<WeightController>(WeightController);
  });

  describe('weight', () => {
    it('should return "Weight Ok - 1"', () => {
      expect(appController.index(id2params(1))).toBe('Weight Ok - 1');
    });
  });
});
