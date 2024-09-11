import express, { Application } from 'express';
import productRoutes from './routes/product.routes';
import { PrismaService } from './config/prisma';

class App {
    public app: Application;
    private prismaService: PrismaService;

    constructor() {
        this.app = express();
        this.prismaService = new PrismaService();
        this.initializeMiddlewares();
        this.initializeRoutes();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
    }

    private initializeRoutes() {
        this.app.use('/products', productRoutes);
    }

    public listen(port: number) {
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}

export default App;
