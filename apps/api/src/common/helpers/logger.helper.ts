import { utilities } from 'nest-winston';
import { format, transports } from 'winston';

export const transportsSetup = () => {
  return new transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'log' : 'debug',
    format: format.combine(format.timestamp(), utilities.format.nestLike(), format.colorize({ all: true })),
  });
};
