import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { doc, tables } from './dynamodb.js'

export async function createNote(userId, noteId, title, content) {
  const now = new Date().toISOString()
  await doc.send(new PutCommand({
    TableName: tables.notes,
    Item: {
      userId,
      noteId,
      title: title || 'Untitled',
      content: content || '',
      createdAt: now,
      updatedAt: now,
    },
  }))
  return { userId, noteId, title: title || 'Untitled', content: content || '', createdAt: now, updatedAt: now }
}

export async function getNote(userId, noteId) {
  const r = await doc.send(new GetCommand({
    TableName: tables.notes,
    Key: { userId, noteId },
  }))
  return r.Item ?? null
}

export async function listNotes(userId) {
  const r = await doc.send(new QueryCommand({
    TableName: tables.notes,
    KeyConditionExpression: 'userId = :u',
    ExpressionAttributeValues: { ':u': userId },
  }))
  const items = (r.Items || []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  return items
}

export async function updateNote(userId, noteId, title, content) {
  const now = new Date().toISOString()
  await doc.send(new UpdateCommand({
    TableName: tables.notes,
    Key: { userId, noteId },
    UpdateExpression: 'SET #t = :t, #c = :c, updatedAt = :u',
    ExpressionAttributeNames: { '#t': 'title', '#c': 'content' },
    ExpressionAttributeValues: {
      ':t': title ?? '',
      ':c': content ?? '',
      ':u': now,
    },
  }))
  return getNote(userId, noteId)
}

export async function deleteNote(userId, noteId) {
  await doc.send(new DeleteCommand({
    TableName: tables.notes,
    Key: { userId, noteId },
  }))
}
