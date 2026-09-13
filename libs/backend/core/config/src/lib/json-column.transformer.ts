import { ValueTransformer } from 'typeorm';

/**
 * MariaDB has no native JSON type — `JSON` is an alias for `LONGTEXT`. Columns
 * declared as `type: 'json'` therefore read back as `longtext`, so schema sync
 * decides they changed on every boot and rewrites them forever. Declaring them
 * as `longtext` and serialising here keeps entity and database in agreement.
 */
export const jsonColumnTransformer: ValueTransformer = {
  to(value: unknown): string | null {
    return value === null || value === undefined ? null : JSON.stringify(value);
  },
  from(value: string | null): unknown {
    if (value === null || value === undefined) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
};
