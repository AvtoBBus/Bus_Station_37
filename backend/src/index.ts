import express, { Application } from 'express';
import { router as itemsRouter } from './routes/Items';

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app: Application = express();
const PORT = process.env.PORT || 3000;
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.ts', 'index.ts'], 
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
const cors = require('cors');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use(cors());

app.use('/', itemsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
