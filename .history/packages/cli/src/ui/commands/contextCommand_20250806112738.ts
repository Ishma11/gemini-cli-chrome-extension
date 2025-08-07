/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageType } from '../types.js';
import { SlashCommand } from './types.js';

export const contextCommand: SlashCommand = {
  name: 'context',
  description: 'Manages local context (from ~/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context/gemini_context.md) in interactive mode.',
  subCommands: [
    {
      name: 'enable',
      description: 'Enables local context (from ~/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context/gemini_context.md) in interactive mode.',
      action: async (context) => {
        context.ui.setEnableLocalContextInInteractiveMode(true);
        return {
          type: 'message',
          messageType: MessageType.INFO,
          content: 'Local context enabled. Content from ~/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context/gemini_context.md will be included in prompts.',
        };
      },
    },
    {
      name: 'disable',
      description: 'Disables local context (from ~/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context/gemini_context.md) in interactive mode.',
      action: async (context) => {
        context.ui.setEnableLocalContextInInteractiveMode(false);
        return {
          type: 'message',
          messageType: MessageType.INFO,
          content: 'Local context disabled. Content from ~/usr/local/google/home/ishmas/gemini-cli/.gemini_cli_context/gemini_context.md will NOT be included in prompts.',
        };
      },
    },
  ],
};
