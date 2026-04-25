import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MEDIUM_USERNAME } from '@ivanrogulj.com/blog';
import { apiUrlInterceptor } from './api-url.interceptor';
import { API_URL } from '@ivanrogulj.com/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor])),
    { provide: MEDIUM_USERNAME, useValue: environment.mediumUsername },
    { provide: API_URL, useValue: environment.apiUrl },
  ],
};
