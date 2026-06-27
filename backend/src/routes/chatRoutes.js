const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const ChatMessage = require('../models/ChatMessage');
const { getAIResponse, analyzeSentiment } = require('../services/aiService');
const auth = require('../middleware/auth');

// Get or create conversation ID
router.post('/send', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
    }

    // Use provided conversation ID or create new one
    const convId = conversationId || uuidv4();

    // Get conversation history for context (last 5 messages)
    const conversationHistory = await ChatMessage.find({
      userId,
      conversationId: convId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userMessage botResponse sentiment')
      .lean();

    // Reverse to get chronological order
    const history = conversationHistory.reverse().map(msg => ({
      user: msg.userMessage,
      bot: msg.botResponse,
      sentiment: msg.sentiment
    }));

    // Get AI response with context
    const startTime = Date.now();
    const aiResult = await getAIResponse(message, history, userId);
    const responseTime = Date.now() - startTime;

    // Analyze sentiment
    const sentiment = analyzeSentiment(message);

    // Save to database
    const chatMessage = new ChatMessage({
      userId,
      conversationId: convId,
      userMessage: message,
      botResponse: aiResult.response,
      sentiment: sentiment,
      keywords: aiResult.keywords,
      aiModel: aiResult.aiModel,
      responseTime
    });

    await chatMessage.save();

    // Check for concerning sentiment
    if (sentiment === 'concerning') {
      console.warn(`⚠️ CONCERNING MESSAGE from user ${userId}: ${message}`);
      // In production, could trigger alerts or escalation
    }

    res.json({
      response: aiResult.response,
      sentiment: sentiment,
      conversationId: convId,
      keywords: aiResult.keywords,
      responseTime,
      model: aiResult.aiModel,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Get chat history for conversation
router.get('/history/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await ChatMessage.find({
      userId,
      conversationId
    })
      .sort({ createdAt: 1 })
      .select('-__v')
      .lean();

    res.json({
      conversationId,
      messages,
      total: messages.length
    });

  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await ChatMessage.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      { $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$userMessage' },
          messageCount: { $sum: 1 },
          lastTime: { $last: '$createdAt' },
          sentiment: { $last: '$sentiment' }
        }
      },
      { $sort: { lastTime: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      conversations,
      total: conversations.length
    });

  } catch (error) {
    console.error('Conversations retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

module.exports = router;
