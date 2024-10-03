import React, { useEffect, useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { PromptAI } from "./PromptAI";
import { convertToFlashCardCurrentBlock } from "@/ollama/commands/convert-to-flash-card";
import { DivideTaskIntoSubTasksCurrentBlock } from "@/ollama/commands/device-task-into-sub-tasks";
import { summarizeBlock } from "@/ollama/commands/summarize-block";
import { summarizePage } from "@/ollama/commands/summarize-page";

const validSelections = ['ask with page context', 'ask with block context', 'ask ai', 'define', 'ask with context'];

export function OllamaCommandPallete({ options, theme }: { options: string[], theme: string }) {
  const [selection, setSelection] = useState('')
  const [isEnterPressed, setIsEnterPressed] = useState(false);

  const handleSelection = (selection: string) => {
    const currentSelection = selection.toLowerCase()
    setSelection(currentSelection)
    setIsEnterPressed(true);
    switch (currentSelection) {
      case "divide into subtasks":
        logseq.hideMainUI()
        DivideTaskIntoSubTasksCurrentBlock()
        break;
      case "summarize page":
        logseq.hideMainUI()
        summarizePage()
        break;
      case "summarize block":
        logseq.hideMainUI()
        summarizeBlock()
        break;
      case "convert to flash card":
        logseq.hideMainUI()
        convertToFlashCardCurrentBlock()
        break;
      default:
        break;
    }
  }

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

  if (isEnterPressed && !validSelections.includes(selection)) {
    return null;
  }

  if(validSelections.includes(selection)) {
    return <PromptAI theme={theme} type={selection} />
  }

  return (
      <Command
        className={(theme === 'dark' ? "dark dark:bg-gray-900" : "bg-gray-200") + " rounded-lg border shadow-md"}>
        <CommandInput className="ai-input" placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {
            options.map((option) => (
              <CommandItem
                key={option}
                value={option}
                className="text-lg cursor-pointer z-50"
                onSelect={handleSelection}>
                <span>{option}</span>
              </CommandItem>
            ))
          }
        </CommandList>
      </Command>
  )
}
