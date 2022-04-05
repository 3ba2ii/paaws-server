export const createSqlTypesIfNotExists = (typeName: string, fields: string) => {
  return `  DO $$ BEGIN
            CREATE TYPE ${typeName} AS ${fields};
            EXCEPTION
            WHEN duplicate_object THEN null;
            END $$;
            `;
};
