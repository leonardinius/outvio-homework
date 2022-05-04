import { Clock } from './clock.interface';

export class TestClock implements Clock {
  constructor(private time: number) {}

  public now(): number {
    return this.time;
  }

  public fastForward(time: number) {
    this.time += time;
  }
}
