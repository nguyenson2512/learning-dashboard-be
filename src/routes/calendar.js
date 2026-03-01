import { Router } from 'express'
import { getMonthVisits, getAllVisits, recordVisit } from '../db/calendar.js'
import { authMiddleware } from '../middleware/auth.js'

export const calendarRouter = Router()
calendarRouter.use(authMiddleware)

function computeStreak(dates) {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort()
  const today = new Date().toISOString().slice(0, 10)
  if (!sorted.includes(today)) return 0
  let streak = 0
  let d = new Date(today)
  const oneDay = 24 * 60 * 60 * 1000
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (sorted.includes(key)) {
      streak++
      d = new Date(d.getTime() - oneDay)
    } else break
  }
  return streak
}

function computePeak(dates) {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort()
  let maxStreak = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime()
    const curr = new Date(sorted[i]).getTime()
    const diff = (curr - prev) / (24 * 60 * 60 * 1000)
    if (diff === 1) current++
    else current = 1
    maxStreak = Math.max(maxStreak, current)
  }
  return maxStreak
}

calendarRouter.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const start = `${month}-01`
    const lastDay = new Date(month + '-01')
    lastDay.setMonth(lastDay.getMonth() + 1)
    lastDay.setDate(0)
    const end = lastDay.toISOString().slice(0, 10)
    const [days, allDates] = await Promise.all([
      getMonthVisits(req.user.userId, month, start, end),
      getAllVisits(req.user.userId),
    ])
    const streak = computeStreak(allDates)
    const peak = computePeak(allDates)
    res.json({ days, streak, peak })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to get calendar' })
  }
})

calendarRouter.post('/visit', async (req, res) => {
  try {
    const date = req.body?.date || new Date().toISOString().slice(0, 10)
    await recordVisit(req.user.userId, date)
    res.json({ date, recorded: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to record visit' })
  }
})
