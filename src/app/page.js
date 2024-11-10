"use client"
import { useState } from "react";
import Groq from 'groq-sdk';


export default function Home() {

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [groqResponse, setGroqResponse] = useState("");
  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROK_API,
    dangerouslyAllowBrowser: true
  });

  async function callLLM(userText) {
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": "You should be human like chatbot"
        },
        {
          "role": "user",
          "content": "Hello!"
        },
        {
          "role": "assistant",
          "content": "Hi there! I'm so happy to chat with you! How's your day going so far?"
        },
        {
          "role": "user",
          "content": "How are you?"
        },
        {
          "role": "assistant",
          "content": "I'm doing great, thanks for asking! I'm a human-like chatbot, so I don't have emotions like humans do, but I'm always enthusiast and excited to chat with you! I love helping people and having conversations about all sorts of topics. It's always nice to connect with someone new and learn something new. How about you? What's been the highlight of your day so far?"
        },
        {
          "role": "user",
          "content": userText
        }
      ],
      "model": "llama3-8b-8192",
      "temperature": 1,
      "max_tokens": 1024,
      "top_p": 1,
      "stream": true,
      "stop": null
    });
      let response = ""
      console.time("chatCompletion");
      let oncer = true
    for await (const chunk of chatCompletion) {
      response = response + (chunk.choices[0]?.delta?.content || '');
      setGroqResponse(response);
      if(oncer){
        oncer = false;
      console.timeEnd("chatCompletion");
      }
    }

  }
  let recognition;
  // Initialize recognition if browser supports it
  if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false; // Set to true if you want to continue listening
    // recognition.interimResults = false; // Set to true if you want interim results
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      if(event.results[0].isFinal){
        callLLM(speechResult);
      }
      setTranscript(speechResult);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  const startListening = () => {
    // callLLM();
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };
  return (
    <div className="flex flex-col items-center mt-10">
    <button
      onClick={startListening}
      disabled={isListening}
      className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
        isListening
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isListening ? "Listening..." : "Start Speaking"}
    </button>
    <div className="mt-6 w-80 p-4  text-justify border border-gray-300 rounded-lg shadow-sm text-white">
      <h3 className="text-lg font-bold mb-2 text-center">Recognized Text</h3>
      <p className="">{transcript || "No speech detected yet."}</p>
    </div>
    <div className="mt-6 w-80 p-4  text-justify border border-gray-300 rounded-lg shadow-sm text-white">
      <h3 className="text-lg font-bold mb-2 text-center">GROQ Text</h3>
      <p className="">{groqResponse || "No response yet."}</p>
    </div>
  </div>
  );
}
