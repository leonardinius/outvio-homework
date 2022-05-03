import { Test, TestingModule } from '@nestjs/testing';
import { PubController } from './pub.controller';

describe('PubController', () => {
  let appController: PubController;
  const id2params = (id) => {
    return { id: id };
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PubController],
      providers: [],
    }).compile();

    appController = app.get<PubController>(PubController);
  });

  describe('pub', () => {
    it('should return "Public Ok - 1"', () => {
      expect(appController.index(id2params(1))).toBe('Public Ok - 1');
    });
  });
});
