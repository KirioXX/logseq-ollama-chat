import React from "react"
import { Message } from "ollama/browser";
import { Loader } from "./Loader";
import Markdown from 'react-markdown'


export const ChatBubble = ({ message, theme, loading, loadingMessage }: { message?: Message, theme: string, loading?: boolean, loadingMessage?: string }) => {
  if (loading || !message) {
    return (
      <div className={`flex p-4 rounded-lg max-w-xs ${theme === "dark" ? "bg-gray-800 text-white" : "bg-blue-500 text-white"}`}>
        <Loader className='mr-2'/> <p>{loadingMessage ?? 'Loading...'}</p>
      </div>
    );
  }

  const content = `${message.role === "user" ? "You" : "🤖 AI"}:

  ${message.content}`;
  return (
    <div
      className={`p-4 rounded-lg max-w-xs ${
      message.role === "user"
        ?
          theme === "dark"
          ? "bg-gray-800 text-white" :
          "bg-blue-500 text-white"
        :
          theme === "dark"
          ? "bg-gray-700 text-white" :
          "bg-gray-300 text-black"
      }`}
    >
      <Markdown>{content}</Markdown>
    </div>
  );
};
