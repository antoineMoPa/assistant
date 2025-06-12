import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { parseEditResponse, applyEdit, EditCommand } from './fileEditor';

const tempFile = path.join(__dirname, 'testfile.txt');

describe('File Editor', () => {
    beforeEach(async () => {
        try { await fs.unlink(tempFile); } catch {}
    });

    afterEach(async () => {
        try { await fs.unlink(tempFile); } catch {}
    });

    it('parses a valid <edit> response correctly', () => {
        const llmResponse = `
        Here is your edit:

        <edit filepath="testfile.txt" mode="append">
        console.log("Hello World");
        </edit>
    `;
        const result = parseEditResponse(llmResponse);
        expect(result).toEqual<EditCommand>({
            filepath: 'testfile.txt',
            mode: 'append',
            content: 'console.log("Hello World");'
        });
    });

    it('returns null for invalid tags', () => {
        const badResponse = `<edit path="oops" mode="write">bad</edit>`;
        expect(parseEditResponse(badResponse)).toBeNull();
    });

    it('creates a new file on replace if file does not exist', async () => {
        const cmd: EditCommand = {
            filepath: tempFile,
            mode: 'replace',
            content: 'let x = 1;'
        };

        await applyEdit(cmd);
        const content = await fs.readFile(tempFile, 'utf8');
        expect(content.trim()).toBe('let x = 1;');
    });

    it('appends to an existing file', async () => {
        await fs.writeFile(tempFile, 'A');

        const cmd: EditCommand = {
            filepath: tempFile,
            mode: 'append',
            content: 'B'
        };

        await applyEdit(cmd);
        const content = await fs.readFile(tempFile, 'utf8');
        expect(content.trim()).toBe('A\nB');
    });

    it('prepends to an existing file', async () => {
        await fs.writeFile(tempFile, 'World');

        const cmd: EditCommand = {
            filepath: tempFile,
            mode: 'prepend',
            content: 'Hello'
        };

        await applyEdit(cmd);
        const content = await fs.readFile(tempFile, 'utf8');
        expect(content.trim()).toBe('Hello\nWorld');
    });
});
