import express from 'express';
import productRoutes from './routes/product.routes';

const app = express();
app.use(express.json());

// Use the product routes with a base path
app.use('/api/products', productRoutes);

// Export app and server for testing purposes
const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export { app, server };
