// import * as global from 'global';
// (window as any).global = global;

import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import 'zone.js';  // Ensure zone.js is included
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
