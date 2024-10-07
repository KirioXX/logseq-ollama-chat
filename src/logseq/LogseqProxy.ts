/***
 * This is a minimal version of the LogseqProxy.ts from the Logseq Anki Sync plugin.
 * */
import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export type SettingsChangeListener = (
  newSettings: any,
  oldSettings: any
) => void;

export namespace LogseqProxy {
  export class Settings {
    static useSettingsSchema(schemas: Array<SettingSchemaDesc>): void {
      logseq.useSettingsSchema(schemas);
    }

    static registeredSettingsChangeListeners: SettingsChangeListener[] = [];

    static registerSettingsChangeListener(
      listener: SettingsChangeListener
    ): void {
      this.registeredSettingsChangeListeners.push(listener);
    }
  }

  export function init() {
    logseq.onSettingsChanged((newSettings, oldSettings) => {
      for (let listener of LogseqProxy.Settings
        .registeredSettingsChangeListeners) {
        listener(newSettings, oldSettings);
      }
    });
  }
}
