import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { doc, tables } from './dynamodb.js'

export async function recordVisit(userId, date) {
  await doc.send(new PutCommand({
    TableName: tables.calendar,
    Item: {
      userId,
      date,
      visited: true,
    },
  }))
}

export async function getMonthVisits(userId, month, startDate, endDate) {
  const start = startDate || `${month}-01`
  const end = endDate || `${month}-31`
  const r = await doc.send(new QueryCommand({
    TableName: tables.calendar,
    KeyConditionExpression: 'userId = :u AND #d BETWEEN :start AND :end',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':u': userId, ':start': start, ':end': end },
  }))
  return (r.Items || []).map((i) => ({ date: i.date, visited: !!i.visited }))
}

export async function getAllVisits(userId) {
  const r = await doc.send(new QueryCommand({
    TableName: tables.calendar,
    KeyConditionExpression: 'userId = :u',
    ExpressionAttributeValues: { ':u': userId },
  }))
  return (r.Items || []).map((i) => i.date).sort()
}
