import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0', // Especificação da OpenAPI
    info: {
      title: 'Sabor na Nuvem - API',
      version: '1.0.0',
      description: 'API para a plataforma white label de fast food Sabor na Nuvem.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL do seu servidor de desenvolvimento
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },

  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
