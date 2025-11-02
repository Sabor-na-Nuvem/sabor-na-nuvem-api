import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sabor na Nuvem - API',
      version: '1.0.0',
      description:
        'API RESTful para a plataforma white label de fast food Sabor na Nuvem.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    // security: [ { bearerAuth: [] } ] // Segurança global (opcional)
  },
  apis: [
    './src/modules/**/*.routes.js',
    './src/docs/**/*.yaml',
    './src/docs/**/*.docs.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
