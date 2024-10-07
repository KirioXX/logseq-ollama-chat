import { BlockIdentity } from "@logseq/libs/dist/LSPlugin";
import { OllamaService } from "@/core/service/OllamaService";
import { Message } from "ollama/browser";

export async function askAI(
  message: Message,
  context?: string,
  blockId?: BlockIdentity
) {
  try {
    const currentBlock = await initTargetBlock(blockId);

    // Generate the AI response
    let response: Message | undefined;
    if (!context) {
      response = await OllamaService.Instance.chat({
        messsages: [message],
        invokeState: currentBlock
          ? { selectedBlocks: [currentBlock] }
          : undefined,
      });
    } else {
      response = await OllamaService.Instance.chat({
        messsages: [
          {
            role: "user",
            content: `With the context of: ${context}, ${message.content}`,
          },
        ],
        invokeState: currentBlock
          ? { selectedBlocks: [currentBlock] }
          : undefined,
      });
    }

    // Update the block with the AI response
    await logseq.Editor.updateBlock(
      blockId ?? currentBlock?.uuid ?? "",
      `> **USER**: ${prompt}

**AI**: ${response}`
    );
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}

async function initTargetBlock(blockId?: BlockIdentity) {
  // Initialize the block with a placeholder text
  let currentBlock;
  if (blockId) {
    currentBlock = await logseq.Editor.insertBlock(
      blockId,
      "⌛Generating....",
      {
        before: false,
      }
    );
  } else {
    // Get a new block on the current page or journal if no blockId is provided
    let currentPage = await logseq.Editor.getCurrentPage();
    if (!currentPage) {
      const todayJournal = await getTodaysJournalPage();
      if (todayJournal) {
        currentPage = todayJournal;
      } else {
        return;
      }
    }
    if (!currentPage) {
      return;
    }
    currentBlock = await logseq.Editor.appendBlockInPage(
      currentPage.uuid,
      "⌛Generating...."
    );
  }
  return currentBlock;
}

async function getTodaysJournalPage() {
  const allPages = await logseq.Editor.getAllPages();
  const allJournal = allPages?.filter((page) => page["journal?"] === true);

  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);

  const currentJournal = allJournal?.find((page) => {
    const date = journalDateConverter(page.journalDay!);
    return date.getTime() === currentDay.getTime();
  });
  return currentJournal;
}

function journalDateConverter(dateNum: number) {
  // Convert number to string and extract parts
  const dateStr = dateNum.toString();
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed in JavaScript Date
  const day = parseInt(dateStr.substring(6, 8), 10);

  // Create the Date object
  const dateObj = new Date(year, month, day);
  dateObj.setHours(0, 0, 0, 0); // Start of the day
  return dateObj;
}
