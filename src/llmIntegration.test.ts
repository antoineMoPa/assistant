import { describe, it, expect } from 'vitest';
import { askOpenAI } from './assistant';
import { parseEditResponse } from './fileEditor';

describe('LLM edit intent detection (live test)', () => {
    it('should return a valid <edit> block when asked to prepend to a file', async () => {
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful shell assistant. When asked to modify files, use this format: <edit filepath="..." mode="...">content</edit>'
            },
            {
                role: 'user',
                content: 'Add "#!/usr/bin/env node" to the top of index.js'
            }
        ];

        const reply = await askOpenAI(messages);
        const edit = parseEditResponse(reply);

        expect(edit).not.toBeNull();
        expect(edit?.filepath).toContain('index.js');
        expect(edit?.mode).toBe('prepend');
        expect(edit?.content).toContain('#!/usr/bin/env node');
    });

    it('should return null if the LLM response does not include an <edit> block', async () => {
        const messages = [
            { role: 'system', content: 'You are a general assistant' },
            { role: 'user', content: 'What is the capital of France?' }
        ];

        const reply = await askOpenAI(messages);
        const edit = parseEditResponse(reply);

        expect(edit).toBeNull();
    });
});
