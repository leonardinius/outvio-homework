import { Test, TestingModule } from '@nestjs/testing';
import { PrivateController } from './private.controller';

describe('PrivateController', () => {
  let appController: PrivateController;
  const id2params = (id) => {
    return { id: id };
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PrivateController],
      providers: [],
    }).compile();

    appController = app.get<PrivateController>(PrivateController);
  });

  describe('pub', () => {
    it('should return "Private Ok - 1"', () => {
      expect(appController.index(id2params(1))).toBe('Private Ok - 1');
    });
  });
});
