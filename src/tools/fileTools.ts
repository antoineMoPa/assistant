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
