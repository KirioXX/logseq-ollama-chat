export type LLMOption = {
  label?: string;
  value: string;
  usePromptInput: boolean;
};

export const llmOptions: (LLMOption | string)[] = [
  {
    value: "Ask ai",
    usePromptInput: true,
  },
  {
    value: "Ask with page context",
    usePromptInput: true,
  },
  {
    value: "Ask with block context",
    usePromptInput: true,
  },
  {
    value: "Define",
    usePromptInput: true,
  },
];
