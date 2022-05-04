import { Clock } from './clock.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemClock implements Clock {
  public now(): number {
    return Date.now();
  }
}
