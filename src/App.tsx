import React, { useEffect, useRef, useState } from "react";
import { useAppVisible } from "./lib/utils";
import { ChatInput } from "./components/ChatInput";
import { Message } from "ollama/browser";
import { ChatBubble } from "./components/ChatBubble";
import { OllamaService } from "./core/service/OllamaService";
import { Basic } from "./prompts/Basic";

function App() {
  const scrollableRef = useRef(null);
  const visible = useAppVisible();
  const [theme, setTheme] = useState<string>('')
  const welcomeMessages = [
    { role: 'bot', content: 'Hello!' },
    { role: 'bot', content: 'How can I help you today?' },
  ]
  const [messages, setMessages] = useState<Message[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTheme = async () => {
    const currentTheme = await logseq.App.getUserConfigs()
    if (!currentTheme) {
      setTheme('dark')
    } else {
      setTheme(currentTheme.preferredThemeMode)
    }
  }

  useEffect(() => {
    getTheme();
  }, [])

  useEffect(() => {
    const handleEsc = (e: any) => {
      if (e.key === 'Escape') {
        logseq.hideMainUI()
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const scrollToBottom = () => {
    if (scrollableRef.current) {
      setTimeout(() => {
        // @ts-ignore
        scrollableRef.current.scrollTo({
          // @ts-ignore
          top: scrollableRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 0)
    }
  }

  useEffect(() => {
    const handleMessages = async () => {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'user') {
        const prompt = Basic.getPrompts().find(p => p.id === 'talk-to-ai')
        const response = await OllamaService.Instance.chat({
          messsages: messages,
          prompt
        })
        if(!response) {
          setMessages([
            ...messages,
            { role: 'assistent', content: 'I am sorry, I could not understand that' }
          ])
          setIsSubmitting(false)
          return
        }
        setMessages([
          ...messages,
          ...response!
        ])
        setIsSubmitting(false)
        scrollToBottom()
      }
    }
    if (isSubmitting) {
      handleMessages()
    }
  }, [messages])

  if (visible) {
    return (
      <div className="flex flex-col justify-end h-screen">
        {/* Chat */}
        <ul ref={scrollableRef} className="overflow-y-scroll">
          {
            [
              ...welcomeMessages,
              ...messages
            ].filter(m => m.role !== 'tool').map((message, index) => (
                <li key={index} className={`pb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <ChatBubble message={message} theme={theme} />
                </li>
            ))
          }
          {
            isSubmitting && (
              <li className={`pb-2 flex justify-start`}>
                <ChatBubble loading theme={theme} loadingMessage="Thinking 🤔..." />
              </li>
            )
          }
        </ul>
        {/* Chat input */}
          <form onSubmit={(e: any) => {
            e.preventDefault()
            setIsSubmitting(true)
            scrollToBottom()

            const userInput = (document.getElementById('chat') as HTMLTextAreaElement).value;
            setMessages([...messages, { role: 'user', content: userInput }]);
            (document.getElementById('chat') as HTMLTextAreaElement).value = '';
          }
          }>
            <ChatInput/>
          </form>
      </div>
    );
  }
  return null;
}

export default App;
