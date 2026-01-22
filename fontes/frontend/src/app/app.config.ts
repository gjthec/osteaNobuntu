import { APP_INITIALIZER, Provider } from '@angular/core';
import { ConfigService } from './core/config/config.service';

export const appInitProviders: Provider[] = [
  {
    provide: APP_INITIALIZER,
    multi: true,
    deps: [ConfigService],
    useFactory: (_: ConfigService) => () => Promise.resolve(),
  },
];
