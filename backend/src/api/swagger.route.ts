import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { swaggerConfig } from '@/shared/config/swagger.config';
import { generateOpenAPIComponents } from '@/shared/utils/openapi.util';

// Import schemas to ensure they are registered
import '@/shared/schemas/response.schema';
import '@/modules/auth/auth.schema';
import '@/modules/users/user.schema';

const router = Router();

/**
 * Generate OpenAPI specification by merging:
 * 1. JSDoc comments from route files
 * 2. Auto-generated schemas from Zod
 */
const generateSwaggerSpec = (): any => {
  // Generate base spec from JSDoc comments
  const baseSpec = swaggerJsdoc(swaggerConfig) as any;

  // Generate OpenAPI components from Zod schemas
  const zodComponents = generateOpenAPIComponents();

  // Merge Zod schemas into the base spec
  if (baseSpec.components && zodComponents.schemas) {
    baseSpec.components.schemas = {
      ...baseSpec.components.schemas,
      ...zodComponents.schemas,
    };
  }

  return baseSpec;
};

// Generate the OpenAPI spec
const swaggerSpec = generateSwaggerSpec();

/**
 * Swagger UI options
 */
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Serve raw OpenAPI JSON spec
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;
