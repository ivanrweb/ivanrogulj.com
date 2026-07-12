import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger as TypeOrmLoggerInterface } from 'typeorm';

// Server only captures stderr (stderr.log) — console.log/info from TypeORM's
// default logger vanish, so route every log through console.error instead.
class StderrTypeOrmLogger implements TypeOrmLoggerInterface {
  public logQuery(query: string, parameters?: unknown[]): void {
    console.error('[TypeORM query]', query, parameters ?? '');
  }
  public logQueryError(error: string | Error, query: string, parameters?: unknown[]): void {
    console.error('[TypeORM query error]', error, query, parameters ?? '');
  }
  public logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    console.error('[TypeORM slow query]', time, query, parameters ?? '');
  }
  public logSchemaBuild(message: string): void {
    console.error('[TypeORM schema]', message);
  }
  public logMigration(message: string): void {
    console.error('[TypeORM migration]', message);
  }
  public log(level: 'log' | 'info' | 'warn', message: unknown): void {
    console.error('[TypeORM]', level, message);
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        logging: ['schema', 'error'],
        logger: new StderrTypeOrmLogger(),
      }),
    }),
  ],
})
export class OrmModule {}
