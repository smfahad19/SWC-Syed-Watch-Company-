import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from './routes/index.js'
import errorHandler from './middleware/error.middleware.js'
import passport from './config/passport.js'

dotenv.config()

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(helmet())

// ✅ Health check — rate limit se pehle rakho taake ping block na ho
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/', (req, res) => res.json({ message: 'SWC API is running' }))

// ✅ Rate limit badha diya — 100 bohot strict tha
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health', // health ping count na ho
  })
)

const allowedOrigins = [
  'https://swc-syed-watch-company.vercel.app',
  'https://swc-syed-watch-company-git-main-fahads-projects-c5bdce25.vercel.app',
  'https://swc-syed-watch-company-ldodicpm6-fahads-projects-c5bdce25.vercel.app',
  'http://localhost:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
  app.use(morgan('dev'))
}

app.use('/api/v1', routes)
app.use(errorHandler)

export default app