import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { createUser, getUserByEmail } from '../db/users.js'
import { authMiddleware, signToken } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }
    const existing = await getUserByEmail(email)
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    const userId = uuid()
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await createUser(userId, email, passwordHash, 'user', name)
    const token = signToken({ userId: user.userId, email: user.email, role: user.role })
    res.json({ token, user: { userId: user.userId, email: user.email, role: user.role, name: user.name } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Signup failed' })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }
    const user = await getUserByEmail(email)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const token = signToken({ userId: user.userId, email: user.email, role: user.role })
    res.json({
      token,
      user: { userId: user.userId, email: user.email, role: user.role, name: user.name },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Login failed' })
  }
})

authRouter.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})
