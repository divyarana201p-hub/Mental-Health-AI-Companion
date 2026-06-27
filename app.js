// Updated AI Companion Dialog Logic
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const userText = inputField.value.trim();
    
    if (userText === "") return;
    
    // 1. Append User Message to UI
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-msg';
    userDiv.innerText = userText;
    chatBox.appendChild(userDiv);
    
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // 2. Add a "typing..." indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-msg';
    typingDiv.innerText = "[SYSTEM] Processing transmission...";
    typingDiv.id = "typing-indicator";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. Send data to Python Backend
    try {
        const response = await fetch("http://127.0.0.1:8000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        
        // Remove typing indicator and append real answer
        document.getElementById("typing-indicator").remove();
        
        const aiDiv = document.createElement('div');
        aiDiv.className = 'message ai-msg';
        
        // Optional: Show the backend's stress detection in the UI
        if(data.detected_stress === "Critical") {
            aiDiv.style.borderLeft = "3px solid #f85149"; // Red warning line
        }
        
        aiDiv.innerText = data.reply;
        chatBox.appendChild(aiDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
    } catch (error) {
        document.getElementById("typing-indicator").remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message system-msg';
        errorDiv.style.color = "#f85149";
        errorDiv.innerText = "[ERROR] Backend server offline. Ensure main.py is running.";
        chatBox.appendChild(errorDiv);
    }
}