import { Router, type Request, type Response } from 'express';
import { query } from '../lib/db.js';
import { encrypt, decrypt } from '../lib/encryption.js';
import { processMessage } from '../lib/advisor.js';
import type { ConversationMessage, ConversationRecord } from '../types.js';

const router = Router();

/**
 * POST /api/conversations
 * Start a new conversation. Returns the conversation_id.
 */
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const { region = 'US' } = req.body as { region?: string };

    const result = await query<ConversationRecord>(
      `INSERT INTO conversations (region) VALUES ($1) RETURNING id, created_at`,
      [region],
    );

    const conversation = result.rows[0];
    res.status(201).json({
      conversation_id: conversation.id,
      created_at: conversation.created_at,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

/**
 * POST /api/conversations/:id/message
 * Send a message and get an AI response.
 */
router.post('/conversations/:id/message', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body as { message?: string };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Fetch existing conversation
    const convoResult = await query<ConversationRecord>(
      `SELECT * FROM conversations WHERE id = $1`,
      [id],
    );

    if (convoResult.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const conversation = convoResult.rows[0];

    // Decrypt existing messages
    let messages: ConversationMessage[] = [];
    if (conversation.encrypted_messages && conversation.iv) {
      const decrypted = decrypt(conversation.encrypted_messages, conversation.iv);
      messages = JSON.parse(decrypted) as ConversationMessage[];
    }

    // Process the message through the advisor
    const aiResponse = processMessage(id, message.trim(), messages);

    // Append user message and AI response
    messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    });
    messages.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date().toISOString(),
    });

    // Encrypt and store
    const { encrypted, iv } = encrypt(JSON.stringify(messages));

    await query(
      `UPDATE conversations
       SET encrypted_messages = $1, iv = $2,
           stack_recommendation = $3, noob_score = $4
       WHERE id = $5`,
      [
        encrypted,
        iv,
        aiResponse.stackRecommendation ? JSON.stringify(aiResponse.stackRecommendation) : null,
        aiResponse.stackRecommendation?.noob_score ?? null,
        id,
      ],
    );

    res.json({
      stage: aiResponse.stage,
      message: aiResponse.message,
      stack_recommendation: aiResponse.stackRecommendation ?? null,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /api/conversations/:id
 * Get a conversation with decrypted messages.
 */
router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query<ConversationRecord>(
      `SELECT * FROM conversations WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const conversation = result.rows[0];

    // Decrypt messages
    let messages: ConversationMessage[] = [];
    if (conversation.encrypted_messages && conversation.iv) {
      const decrypted = decrypt(conversation.encrypted_messages, conversation.iv);
      messages = JSON.parse(decrypted) as ConversationMessage[];
    }

    res.json({
      id: conversation.id,
      region: conversation.region,
      experience_level: conversation.experience_level,
      intent: conversation.intent,
      messages,
      stack_recommendation: conversation.stack_recommendation,
      noob_score: conversation.noob_score,
      created_at: conversation.created_at,
      expires_at: conversation.expires_at,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;
