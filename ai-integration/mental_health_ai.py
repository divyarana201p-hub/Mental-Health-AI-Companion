import logging
from transformers import pipeline
import numpy as np

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MentalHealthAI:
    """
    Intelligent AI chatbot for mental health support
    Uses Hugging Face transformers for NLP
    """
    
    def __init__(self):
        """Initialize AI models"""
        try:
            # Initialize sentiment analysis
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            # Initialize question answering
            self.qa_pipeline = pipeline(
                "question-answering",
                model="distilbert-base-cased-distilled-squad"
            )
            
            # Mental health knowledge base
            self.knowledge_base = self._build_knowledge_base()
            
            logger.info("✅ AI models loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error initializing AI models: {str(e)}")
            raise

    def _build_knowledge_base(self):
        """Build knowledge base for cybersecurity mental health"""
        return {
            "stress_management": [
                "Take regular breaks to prevent burnout",
                "Practice deep breathing exercises",
                "Exercise for at least 30 minutes daily",
                "Maintain a consistent sleep schedule"
            ],
            "work_life_balance": [
                "Set clear boundaries between work and personal time",
                "Disconnect from emails after work hours",
                "Pursue hobbies outside of work",
                "Schedule regular vacation time"
            ],
            "anxiety": [
                "Practice mindfulness meditation",
                "Try progressive muscle relaxation",
                "Talk to someone you trust",
                "Consider professional counseling"
            ],
            "burnout": [
                "Reduce your workload if possible",
                "Take time off to recover",
                "Speak with your manager about support",
                "Seek professional mental health services"
            ]
        }

    def analyze_sentiment(self, text):
        """Analyze sentiment of user message"""
        try:
            result = self.sentiment_analyzer(text)[0]
            label = result['label'].lower()
            score = result['score']
            
            # Map to custom sentiment levels
            if label == 'negative' and score > 0.8:
                return 'concerning'
            elif label == 'negative':
                return 'negative'
            elif label == 'positive':
                return 'positive'
            else:
                return 'neutral'
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return 'neutral'

    def extract_keywords(self, text):
        """Extract key topics from user message"""
        keywords = []
        
        topic_keywords = {
            'stress': ['stress', 'stressed', 'pressure', 'tense', 'anxious'],
            'burnout': ['burnout', 'exhausted', 'tired', 'worn out', 'drained'],
            'work_life': ['balance', 'work life', 'personal time', 'rest', 'break'],
            'sleep': ['sleep', 'insomnia', 'tired', 'fatigue', 'rest'],
            'security': ['incident', 'attack', 'breach', 'threat', 'cyber']
        }
        
        text_lower = text.lower()
        for topic, terms in topic_keywords.items():
            if any(term in text_lower for term in terms):
                keywords.append(topic)
        
        return keywords

    def generate_response(self, user_message, conversation_history=None, keywords=None):
        """
        Generate intelligent contextual response
        
        Args:
            user_message: The user's input message
            conversation_history: List of previous exchanges for context
            keywords: Extracted keywords from the message
        
        Returns:
            dict: Response with generated message, sentiment, and metadata
        """
        try:
            # Analyze sentiment
            sentiment = self.analyze_sentiment(user_message)
            
            # Extract keywords if not provided
            if not keywords:
                keywords = self.extract_keywords(user_message)
            
            # Generate contextual response
            response = self._get_contextual_response(
                user_message,
                sentiment,
                keywords,
                conversation_history
            )
            
            return {
                'response': response,
                'sentiment': sentiment,
                'keywords': keywords,
                'model': 'transformers-based-fine-tuned',
                'responseTime': 0  # Will be set by caller
            }
            
        except Exception as e:
            logger.error(f"Response generation error: {str(e)}")
            return {
                'response': "I appreciate you sharing that with me. Can you tell me more about what you're experiencing?",
                'sentiment': 'neutral',
                'keywords': [],
                'model': 'fallback',
                'responseTime': 0
            }

    def _get_contextual_response(self, user_message, sentiment, keywords, history):
        """Generate response based on context"""
        
        # Response templates based on sentiment and keywords
        response_templates = {
            ('concerning', 'stress'): "I hear that you're experiencing significant stress. This is concerning. Would you like to talk about what's happening? Professional support is available if you need it.",
            ('negative', 'burnout'): "Burnout is a serious matter. You deserve rest and recovery. Have you considered taking time off or speaking with a professional? Let's explore some recovery strategies together.",
            ('negative', 'stress'): "It sounds like you're under a lot of stress right now. That's a common challenge in cybersecurity work. What specific situation is causing you the most concern?",
            ('neutral', 'work_life'): "Work-life balance is crucial for long-term success. What does a good balance look like for you? Are you currently able to disconnect from work?",
            ('positive', 'stress'): "I'm glad to hear you're managing stress well! What strategies are working for you? We can help you maintain this positive momentum.",
        }
        
        # Try to find best matching response
        for (sent, keyword), template in response_templates.items():
            if sentiment == sent and keyword in keywords:
                return template
        
        # Default responses based on sentiment
        default_responses = {
            'concerning': "I'm concerned about what you're sharing. Please know that help is available. Would you like information about mental health resources?",
            'negative': "It sounds like you're going through a challenging time. I'm here to listen. Can you tell me more about what's bothering you?",
            'positive': "That's wonderful! It's great to hear positive things from you. Keep up the momentum! What's been helping you?",
            'neutral': "Thank you for sharing. I'd like to understand you better. What's on your mind today?"
        }
        
        return default_responses.get(sentiment, default_responses['neutral'])

    def get_recommendations(self, keywords, sentiment):
        """Get mental health recommendations based on keywords"""
        recommendations = []
        
        for keyword in keywords:
            if keyword in self.knowledge_base:
                # Get first recommendation from knowledge base
                rec = self.knowledge_base[keyword]
                if rec:
                    recommendations.append(rec[0])
        
        # Add sentiment-specific recommendations
        if sentiment == 'concerning':
            recommendations.insert(0, "Please reach out to a mental health professional if you haven't already.")
        
        return recommendations[:3]  # Return top 3 recommendations


# Initialize AI
ai = MentalHealthAI()
