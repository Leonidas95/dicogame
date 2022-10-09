import { Logger } from '@nestjs/common';

export const getLoggerProvider = () => ({
  provide: Logger,
  useFactory: jest.fn(() => ({
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
  })),
});
