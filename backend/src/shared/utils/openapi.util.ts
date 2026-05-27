import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

/**
 * Global OpenAPI registry for registering Zod schemas
 */
export const registry = new OpenAPIRegistry();

/**
 * Generate OpenAPI components from registered Zod schemas
 * @returns OpenAPI components object with schemas
 */
export const generateOpenAPIComponents = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const components = generator.generateComponents();
  
  return components.components || {};
};

/**
 * Helper to register a Zod schema in the OpenAPI registry
 * @param name - Schema name for OpenAPI reference
 * @param schema - Zod schema with .openapi() metadata
 */
export const registerSchema = <T>(name: string, schema: T) => {
  registry.register(name, schema as any);
  return schema;
};
