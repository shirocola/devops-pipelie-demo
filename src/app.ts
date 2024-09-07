import express from 'express'
import productRoutes from './routes/product.routes'

const app = express()

app.use(express.json()) // สำหรับการรับข้อมูล JSON
app.use('/api', productRoutes)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
