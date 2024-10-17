import React, { useEffect, useRef, useState } from "react";
import { useAppVisible } from "./utils";
import { ChatInput } from "./components/ChatInput";
import { ChatBubble } from "./components/ChatBubble";
import { Basic } from "./prompts/Basic";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { LangGraphService } from "./core/service/LangchainService";
import { Button } from "./components/Button";
import { summarizeBlock } from "./ollama/commands/summarize-block";
import { elaborateBlock } from "./ollama/commands/elaborate-block";

function App() {
  const scrollableRef = useRef(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const visible = useAppVisible();
  const [theme, setTheme] = useState<string>('')
  const welcomeMessages = [
    new AIMessage(`**Hello!**

    How can I help you today?`)
  ]
  const [messages, setMessages] = useState<(HumanMessage | AIMessage)[]>([])
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
      if (lastMessage.getType() === 'human') {
        const prompt = Basic.getPrompts().find(p => p.id === 'talk-to-ai')
        const response = await LangGraphService.Instance.chat({
          messsage: lastMessage,
          prompt
        })
        if(!response) {
          setMessages([
            ...messages,
            new AIMessage('I am sorry, I could not understand that')
          ])
          setIsSubmitting(false)
          return
        }
        setMessages([
          ...messages,
          response!
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
            ].map((message, index) => (
                <li key={index} className={`pb-2 flex ${message.getType() === 'human' ? 'justify-end' : 'justify-start'}`}>
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
        <ul className="flex">
          <li>
            <Button onClick={() => summarizeBlock()}>
              Summarize Block
            </Button>
          </li>
          <li>
            <Button onClick={() => elaborateBlock()}>
              Elaborate Block
            </Button>
          </li>
        </ul>
          <form onSubmit={(e: any) => {
            e.preventDefault()
            setIsSubmitting(true)
            scrollToBottom()

            const formData = new FormData(e.currentTarget);
            const message = formData.get("message") as string;

            if (message.trim() !== "") {
              setMessages([...messages, new HumanMessage(message)]);

              // Clear the textarea by calling the reset method in ChatInput
              if (chatInputRef.current) {
                chatInputRef.current.value = "";
              }

              e.currentTarget.reset(); // Optionally reset form after submission
            }
          }
          }>
            <ChatInput inputRef={chatInputRef}/>
          </form>
      </div>
    );
  }
  return null;
}

export default App;
