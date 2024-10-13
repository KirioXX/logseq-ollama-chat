import React from "react"
import { Loader } from "./Loader";
import Markdown from 'react-markdown'
import { AIMessage, HumanMessage } from "@langchain/core/messages";


export const ChatBubble = ({ message, theme, loading, loadingMessage }: { message?: AIMessage | HumanMessage, theme: string, loading?: boolean, loadingMessage?: string }) => {
  if (loading || !message) {
    return (
      <div className={`flex p-4 rounded-lg max-w-xs ${theme === "dark" ? "bg-gray-800 text-white" : "bg-blue-500 text-white"}`}>
        <Loader className='mr-2'/> <p>{loadingMessage ?? 'Loading...'}</p>
      </div>
    );
  }

  const content = `${message.getType() === 'human' ? "😊You" : message.getType() === 'ai' ? "🤖AI" : '🔨Tool'}:

  ${message.content}`;
  return (
    <div
      className={`p-4 rounded-lg max-w-xs ${
      message.getType() === "human"
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
