import React, { useState, useEffect } from "react";

const sendQueryToGemini = async (message, systemPrompt) => {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, systemPrompt })
    });

    const data = await res.json();
    return { text: data.text, sources: [] };

  } catch (err) {
    console.error("Frontend Gemini error:", err);
    return { text: "Error connecting to Gemini backend", sources: [] };
  }
};

export default function AiChatWidget({ selectedNoteId, refreshCount, notes }){
   const [chatLog, setChatLog] = useState(() => {
   try {
      const saved = localStorage.getItem('ai_chat_log');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore parse errors */ }
    return [{ id: 1, sender: 'AI', message: 'Hello! I am your AI Assistant. I can use the currently selected note for context.', sources: [] }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const chatLogRef = React.useRef(null);
  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const noteContent = selectedNote ? selectedNote.content : '';
  

  // Inter-Widget Communication: React to refreshCount changes (Broadcast Reaction)
  useEffect(() => {
    if (refreshCount > 0) {
      setChatLog(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'AI', message: `[System Update] Analytics data has been refreshed ${refreshCount} time(s). This may affect business context.`, sources: [] }
      ]);
    }

    if (chatLogRef.current) {
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
    try { localStorage.setItem('ai_chat_log', JSON.stringify(chatLog)); } catch (e) { }
  }, [refreshCount, chatLog]); 

  const handleSend = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = input;
    setInput('');
    setChatLog(prev => [...prev, { id: Date.now(), sender: 'User', message: userMessage, sources: [] }]);
    setLoading(true);

    const contextPrompt = noteContent 
        ? `The user has selected a note with the content: "${noteContent}". Keep this context in mind when answering.`
        : `The user has no active note selected. Answer generally and use Google Search.`;
    
    const systemPrompt = `You are a helpful dashboard AI assistant. Provide concise and accurate answers. ${contextPrompt}`;

    try {
        const { text, sources } = await sendQueryToGemini(userMessage, systemPrompt);
        setChatLog(prev => [...prev, { id: Date.now() + 2, sender: 'AI', message: text, sources: sources }]);
    } catch (error) {
        setChatLog(prev => [...prev, { id: Date.now() + 2, sender: 'AI', message: "I am unable to complete your request due to an API error.", sources: [] }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-xl h-full flex flex-col border border-indigo-200 min-h-0 max-h-80">
      <h3 className="text-xl font-bold mb-3 text-indigo-700 flex-shrink-0">AI Assistant ({selectedNoteId ? `Note #${selectedNoteId} Context` : 'Global Context'})</h3>
      
      <div 
        ref={chatLogRef}
        className="flex-grow overflow-y-auto space-y-3 p-2 border border-gray-200 rounded-lg mb-3 bg-gray-50 min-h-0"
      >
        {chatLog.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm break-words ${
              msg.sender === 'User' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}>
              {msg.message}
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600">
                  <p className="font-semibold mb-1">Sources:</p>
                  <ul className="list-disc ml-4 space-y-0.5">
                    {msg.sources.map((source, idx) => (
                      <li key={idx} className="truncate">
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-600 hover:text-indigo-800"
                          title={source.title}
                        >
                          {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
            <div className="flex justify-start">
                <div className="p-3 bg-gray-200 text-gray-700 rounded-xl rounded-tl-none max-w-xs flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    AI is thinking...
                </div>
            </div>
        )}
      </div>

      <div className="flex flex-shrink-0">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-0 focus:border-gray-300 text-gray-900 text-opacity-100 disabled:bg-gray-100"
          placeholder="Ask the AI about your data or the world..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button
          className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Send'}
        </button>
      </div>
    </div>
  );
};
