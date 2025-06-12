import fs from 'fs';
import { Tool } from './types';

export const readFileTool: Tool = {
    name: "read_file",
    description: "Reads the content of a file",
    parameters: { path: "string" },
    run: async ({ path }) => {
        try {
            const content = await fs.readFileSync(path, 'utf8');
            return content;
        } catch (err: any) {
            return `[Error] Failed to read file: ${err.message}`;
        }
    }
};

export const listFilesTool: Tool = {
    name: "list_files",
    description: "Lists files in a directory",
    parameters: { dir: "string" },
    run: async ({ dir }) => {
        try {
            const files = await fs.readdirSync(dir);
            return files.join('\n');
        } catch (err: any) {
            return `[Error] Failed to list files: ${err.message}`;
        }
    }
};

export const editFileTool: Tool = {
    name: "edit_file",
    description: "Edits a file by appending content",
    parameters: {
        filepath: "string",
        mode: "string|append|prepend",
        content: "string"
    },
    run: async ({ filepath, mode, content }) => {
        try {
            let finalContent = content;

            if (fs.existsSync(filepath)) {
                const existingContent = fs.readFileSync(filepath, 'utf8');

                if (mode === 'append') {
                    finalContent = existingContent + '\n' + content;
                } else if (mode === 'prepend') {
                    finalContent = content + '\n' + existingContent;
                }
            }

            fs.writeFileSync(filepath, finalContent, 'utf8');
            return `✅ File edited successfully: ${filepath}`;
        } catch (err: any) {
            return `[Error] Failed to edit file: ${err.message}`;
        }
    }
};
