/**
 * This file collects and returns all the prompts.
 * Please ensure that the name field is always unique.
 */
import { Basic } from "./Basic";
import { Prompt } from "../types/Prompt";
import { Flashcard } from "./Flashcard";
import { Task } from "./Task";

export async function getAllPrompts(): Promise<Prompt[]> {
  let prompts: Prompt[] = [
    ...Basic.getPrompts(),
    ...Flashcard.getPrompts(),
    ...(await Task.getPrompts()),
  ];
  return prompts;
}
