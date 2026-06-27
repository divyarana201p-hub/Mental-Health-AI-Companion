from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os

# ==========================================
# 1. Configuration & Setup
# ==========================================
app = FastAPI(title="AegisMind Backend API")

# Allow your local HTML file to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Add your actual Gemini API key here or set it as an environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)

# Use the Gemini 1.5 Flash model for fast chat responses
model = genai.GenerativeModel('gemini-1.5-flash')

# ==========================================
# 2. Data Models & Dictionaries
# ==========================================
class ChatRequest(BaseModel):
    message: str
    user_id: str = "CyberStudent_0x1"

class ChatResponse(BaseModel):
    reply: str
    detected_stress: str
    detected_keywords: list[str]

# Domain-specific keyword mappings
CYBER_KEYWORDS = {
    "imposter_syndrome": ["fraud", "stupid", "everyone else", "not good enough", "give up"],
    "academic_stress": ["oscp", "exam", "grade", "fail", "certification"],
    "technical_frustration": ["buffer overflow", "ctf", "payload", "exploit", "kernel", "debug", "compiler"]
}

# ==========================================
# 3. Core Processing Pipeline
# ==========================================
def analyze_context(text: str):
    text_lower = text.lower()
    detected_tags = []
    
    # Scan for keywords
    for category, words in CYBER_KEYWORDS.items():
        if any(word in text_lower for word in words):
            detected_tags.append(category)
            
    # Simple stress vector assessment
    stress_level = "Nominal"
    if "imposter_syndrome" in detected_tags or "academic_stress" in detected_tags:
        stress_level = "High"
    if "give up" in text_lower or "burnout" in text_lower:
        stress_level = "Critical"
        
    return detected_tags, stress_level

def build_system_prompt(stress_level: str, tags: list[str]) -> str:
    return f"""
    You are AegisMind, an empathetic and highly technical mental health AI companion 
    designed exclusively for university cybersecurity students.
    
    Current User Diagnostic:
    - Estimated Stress Level: {stress_level}
    - Detected Context Tags: {', '.join(tags) if tags else 'General Fatigue'}
    
    Instructions:
    1. Validate their emotions immediately without sounding robotic.
    2. Use subtle computer science, networking, or cybersecurity analogies to explain mental well-being 
       (e.g., "cognitive buffer overflow", "rebooting your mental state", "stepping away from the terminal").
    3. Keep responses concise, supportive, and grounded in reality. Do not be overly cheerful; 
       mirror the serious reality of infosec.
    4. If stress is High or Critical, gently suggest they execute an offline protocol (like sleeping or breathing).
    """

# ==========================================
# 4. API Endpoints
# ==========================================
@app.post("/api/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    # Step 1 & 2: Ingest and Analyze
    user_message = request.message
    tags, stress_level = analyze_context(user_message)
    
    # Step 3: Build the dynamic prompt
    system_instructions = build_system_prompt(stress_level, tags)
    full_prompt = f"{system_instructions}\n\nUser Message: {user_message}"
    
    try:
        # Step 4: Synthesize Output via LLM
        response = model.generate_content(full_prompt)
        ai_text = response.text
    except Exception as e:
        ai_text = "[SYSTEM ERROR] Connection to AI core severed. Please remember to breathe and try again later."
        print(f"API Error: {e}")

    return ChatResponse(
        reply=ai_text,
        detected_stress=stress_level,
        detected_keywords=tags
    )