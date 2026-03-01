import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { notesRouter } from './routes/notes.js'
import { calendarRouter } from './routes/calendar.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/notes', notesRouter)
app.use('/api/calendar', calendarRouter)

app.get('/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`)
})
