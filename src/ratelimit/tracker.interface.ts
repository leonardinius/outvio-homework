import { Request } from 'express';

export type RequestKey = string;

export interface RequestTracker {
  trackerKey(req: Request): RequestKey;
}
