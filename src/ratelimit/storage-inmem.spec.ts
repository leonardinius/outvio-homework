import { RateLimitStorageService } from './storage-inmem.service';
import { Clock } from '../clock/clock.interface';
import { TestClock } from '../clock/test-clock.class';

describe('RateLimitStorageService', () => {
  let storageService: RateLimitStorageService;
  let clock: Clock;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  beforeEach(async () => {
    clock = new TestClock(0);
    storageService = new RateLimitStorageService(clock);
  });

  describe('storage', () => {
    it('should return empty on empty storage', async () => {
      expect(await storageService.get('random-key1')).toEqual([]);
    });

    it('store 10, 11 - then retrieve to get same', async () => {
      await storageService.store('random-key1', 10);
      await storageService.store('random-key1', 11);
      const ttl1 = clock.now() + 10 * 1000;
      const ttl2 = clock.now() + 11 * 1000;
      expect(await storageService.get('random-key1')).toEqual([ttl1, ttl2]);
    });

    it('the keys expire with timeout', async () => {
      await storageService.store('random-key1', 1);
      await storageService.store('random-key1', 11);
      await delay(1100);
      const ttl2 = clock.now() + 11 * 1000;

      // we expect the first key to expire and to be removed, the second one should stay
      expect(await storageService.get('random-key1')).toEqual([ttl2]);
    });
  });
});
