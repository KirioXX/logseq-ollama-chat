import React, { useEffect, useRef, useState } from "react";
import { OllamaCommandPallete } from "./components/OllamaCommandPallete";
import { useAppVisible } from "./lib/utils";

const options = [
  'Ask ai',
  'Ask with page context',
  'Ask with block context',
  'Define',
  'Divide into subtasks',
  'Summarize Page',
  'Summarize Block',
  'Convert to flash card',
];

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const [theme, setTheme] = useState<string>('')

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

  if (visible) {
    return (
      <main
        className="fixed inset-0 flex items-center justify-center"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} className="flex items-center justify-center w-3/4">
          <OllamaCommandPallete options={options} theme={theme} />
        </div>
      </main>
    );
  }
  return null;
}

export default App;
