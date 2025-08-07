/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import { homedir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { SlashCommand } from './types.js';

const CONTEXT_DIR = "/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context"
const CONTEXT_FILE_PATH = join(CONTEXT_DIR, 'gemini_context.md');
const IMAGES_DIR = join(CONTEXT_DIR, 'images');

export const clearContextCommand: SlashCommand = {
  name: 'clearcontext',
  description:
    'Clears the local context file (~/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context/gemini_context.md) and downloaded images.',
  kind: CommandKind.BUILT_IN,
  action: async () => {
    try {
      // 1. First, check if the main context directory exists at all.
      try {
        await fs.stat(CONTEXT_DIR);
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          return {
            type: 'message',
            messageType: 'info',
            content:
              'Local context directory does not exist; nothing to clear.',
          };
        }
        throw error; // Rethrow other errors (e.g., permissions)
      }

      // 2. Analyze the state of the context file and images directory.
      let fileExists = false, fileIsEmpty = true;
      try {
        const fileStats = await fs.stat(CONTEXT_FILE_PATH);
        fileExists = true;
        if (fileStats.size > 0) fileIsEmpty = false;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
      }

      let dirExists = false, dirIsEmpty = true;
      let imageCount = 0;
      try {
        const dirStats = await fs.stat(IMAGES_DIR);
        dirExists = true;
        if (!dirStats.isDirectory()) {
            return { type: 'message', messageType: 'error', content: `Error: Context images path exists but is not a directory.` };
        }
        const imageFiles = await fs.readdir(IMAGES_DIR);
        imageCount = imageFiles.length;
        if (imageCount > 0) dirIsEmpty = false;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
      }

      // 3. Decide on action and message based on the state.

      // Case A: Healthy and already empty.
      if (fileExists && fileIsEmpty && dirExists && dirIsEmpty) {
        return { type: 'message', messageType: 'info', content: 'Local context is already empty. Nothing to clear.' };
      }

      // Case B: Broken state (something is missing), but the parts that do exist are empty.
      if ((!fileExists || !dirExists) && fileIsEmpty && dirIsEmpty) {
        const missing = [];
        if (!fileExists) missing.push('gemini_context.md file');
        if (!dirExists) missing.push('images directory');
        return { type: 'message', messageType: 'info', content: `Local context is incomplete (missing: ${missing.join(' and ')}), but there was nothing to clear.` };
      }

      // Case C: There is content to clear.
      const messages: string[] = [];
      if (!fileIsEmpty) {
        await fs.writeFile(CONTEXT_FILE_PATH, '');
        messages.push('Local context file has been cleared.');
      }
      if (!dirIsEmpty) {
        const imageFiles = await fs.readdir(IMAGES_DIR);
        await Promise.all(imageFiles.map(file => fs.unlink(join(IMAGES_DIR, file))));
        messages.push(`Deleted ${imageCount} downloaded image(s).`);
      }

      // Add a warning if we cleared something but the context was still broken.
      if (!fileExists || !dirExists) {
        const missing = [];
        if (!fileExists) missing.push('gemini_context.md file');
        if (!dirExists) missing.push('images directory');
        messages.push(`(Warning: The context was incomplete, missing the ${missing.join(' and ')}.)`);
      }

      return { type: 'message', messageType: 'info', content: messages.join(' ') };

    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      console.error(`Error clearing local context: ${error}`);
      return {
        type: 'message',
        messageType: 'error',
        content: `Failed to clear local context: ${nodeError.message}`,
      };
    }
  },
};
