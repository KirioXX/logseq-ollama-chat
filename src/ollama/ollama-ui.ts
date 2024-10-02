export async function ollamaUI() {
  logseq.showMainUI({
    autoFocus: true,
  });
  setTimeout(() => {
    const element = document.querySelector(
      ".ai-input"
    ) as HTMLInputElement | null;
    if (element) {
      element.focus();
    }
  }, 300);
}
