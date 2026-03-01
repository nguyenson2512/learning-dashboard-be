import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { doc, tables } from './dynamodb.js'

export async function createUser(userId, email, passwordHash, role = 'user', name) {
  await doc.send(new PutCommand({
    TableName: tables.users,
    Item: {
      userId,
      email,
      passwordHash,
      role,
      name: name || email,
      createdAt: new Date().toISOString(),
    },
    ConditionExpression: 'attribute_not_exists(userId)',
  }))
  return { userId, email, role, name: name || email }
}

export async function getUserByEmail(email) {
  const r = await doc.send(new QueryCommand({
    TableName: tables.users,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :e',
    ExpressionAttributeValues: { ':e': email },
  }))
  return r.Items?.[0] ?? null
}

export async function getUserById(userId) {
  const r = await doc.send(new GetCommand({
    TableName: tables.users,
    Key: { userId },
  }))
  return r.Item ?? null
}
