import { zodToJsonSchema } from '@alcyone-labs/zod-to-json-schema';
import { z } from 'zod';

export function toJsonSchema(schema: z.ZodType<any>) {
  return zodToJsonSchema(schema, { target: 'openApi3' });
}
