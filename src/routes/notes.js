import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { authMiddleware } from '../middleware/auth.js'
import * as notesDb from '../db/notes.js'
import { callAiGenerateCards } from '../services/ai.js'

export const notesRouter = Router()
notesRouter.use(authMiddleware)

notesRouter.get('/', async (req, res) => {
  try {
    const list = await notesDb.listNotes(req.user.userId)
    res.json(list)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to list notes' })
  }
})

notesRouter.post('/', async (req, res) => {
  try {
    const { title, content } = req.body
    const noteId = uuid()
    const note = await notesDb.createNote(req.user.userId, noteId, title, content)
    res.status(201).json(note)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to create note' })
  }
})

notesRouter.get('/:noteId', async (req, res) => {
  try {
    const note = await notesDb.getNote(req.user.userId, req.params.noteId)
    if (!note) return res.status(404).json({ message: 'Note not found' })
    res.json(note)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to get note' })
  }
})

notesRouter.put('/:noteId', async (req, res) => {
  try {
    const { title, content } = req.body
    const note = await notesDb.updateNote(req.user.userId, req.params.noteId, title, content)
    res.json(note)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to update note' })
  }
})

notesRouter.delete('/:noteId', async (req, res) => {
  try {
    await notesDb.deleteNote(req.user.userId, req.params.noteId)
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to delete note' })
  }
})

notesRouter.post('/:noteId/generate-cards', async (req, res) => {
  try {
    const note = await notesDb.getNote(req.user.userId, req.params.noteId)
    if (!note) return res.status(404).json({ message: 'Note not found' })
    const type = req.body?.type || 'flashcard'
    const cards = await callAiGenerateCards(note.content, type)
    res.json({ cards })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to generate cards', detail: e.message })
  }
})
