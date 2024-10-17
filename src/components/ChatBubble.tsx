import React from "react"
import { Loader } from "./Loader";
import Markdown from 'react-markdown'
import { AIMessage, HumanMessage } from "@langchain/core/messages";


export const ChatBubble = ({ message, theme, loading, loadingMessage }: { message?: AIMessage | HumanMessage, theme: string, loading?: boolean, loadingMessage?: string }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (loading || !message) {
    return (
      <div className={`flex p-4 rounded-lg max-w-xs ${theme === "dark" ? "bg-gray-800 text-white" : "bg-blue-500 text-white"}`}>
        <Loader className='mr-2'/> <p>{loadingMessage ?? 'Loading...'}</p>
      </div>
    );
  }

  const title = message.getType() === 'human' ? "You" : message.getType() === 'ai' ? "AI" : 'Tool';
  const content = message.content.toString();

  const handleCopy = (e: any) => {
    e.preventDefault();
    navigator.clipboard.writeText(content);
    logseq.UI.showMsg('Copied to clipboard');
    setIsMenuOpen(false);
  }

  return (
    <div className={`flex ${message.getType() === 'human' ? 'flex-row-reverse' : ''} items-start gap-2.5`}>
      <img className="w-8 h-8 rounded-full" src={`../../assets/${message.getType() === 'human' ? 'user_icon.png' :'app_icon.png'}`} alt="Ollama Chat"/>
      <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
          </div>
          <Markdown
            className="text-sm font-normal py-2.5 text-gray-900 dark:text-white"
            components={{
              p: ({ children }) => <p className="text-sm font-normal text-gray-900 dark:text-white">{children}</p>,
              a: ({ children, href}) => <a href={href} target="_blank" className="text-blue-500 dark:text-blue-400">{children}</a>
            }}
          >{content}</Markdown>
      </div>
      <button onClick={() => {
        setIsMenuOpen(!isMenuOpen);
      }} id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" className="inline-flex self-start items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600" type="button">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
          </svg>
      </button>
      <div id="dropdownDots" className={`z-10 ${isMenuOpen ? 'visible' :'hidden'} bg-white divide-y divide-gray-100 rounded-lg shadow w-40 dark:bg-gray-700 dark:divide-gray-600`}>
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownMenuIconButton">
            <li>
                <a onClick={handleCopy} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">Copy</a>
            </li>
          </ul>
      </div>
    </div>
    );
};
