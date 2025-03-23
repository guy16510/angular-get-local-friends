// handler-response-types.ts

import { AnimalProfile } from './types';
import { DeepProfileInsights } from './deep-profile-insights';

export interface GetAnimalProfileResponse {
  selfProfile: AnimalProfile;
  seekingProfile: AnimalProfile;
  deepInsights: DeepProfileInsights;
}

export interface HandlerSuccessResponse {
  statusCode: 200;
  headers: { 'Content-Type': string };
  body: string; // JSON.stringify(GetAnimalProfileResponse)
}

export interface HandlerErrorResponse {
  statusCode: 400 | 401 | 404 | 500;
  headers: { 'Content-Type': string };
  body: string; // JSON.stringify({ message: string })
}

export type HandlerResponse = HandlerSuccessResponse | HandlerErrorResponse;
