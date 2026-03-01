import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.AWS_ENDPOINT && { endpoint: process.env.AWS_ENDPOINT }),
})

export const doc = DynamoDBDocumentClient.from(client)

export const tables = {
  users: process.env.USERS_TABLE || 'learning-dashboard-users-dev',
  notes: process.env.NOTES_TABLE || 'learning-dashboard-notes-dev',
  calendar: process.env.CALENDAR_TABLE || 'learning-dashboard-calendar-dev',
}
