import axios from 'axios'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

export async function callAiGenerateCards(content, type = 'flashcard') {
  const { data } = await axios.post(`${AI_SERVICE_URL}/generate-cards`, {
    content: content || '',
    type,
  }, { timeout: 60000 })
  return data.cards || []
}
