"use client"
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  let recognition;
  // Initialize recognition if browser supports it
  if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false; // Set to true if you want to continue listening
    recognition.interimResults = false; // Set to true if you want interim results
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
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
    <div className="mt-6 w-80 p-4 border border-gray-300 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-2">Recognized Text:</h3>
      <p className="text-gray-800">{transcript || "No speech detected yet."}</p>
    </div>
  </div>
  );
}
