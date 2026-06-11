import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import routes from './routes/index.js'
import errorHandler from './middleware/error.middleware.js'
import passport from './config/passport.js';

dotenv.config()

const app = express()

app.use(helmet())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api/v1', routes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})