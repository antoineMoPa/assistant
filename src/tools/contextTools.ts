import fs from 'fs';
import { Tool } from './types';
import { execSync } from 'child_process';

const execNoThrow = (cmd: string) => {
    try {
        return execSync(cmd, { encoding: 'utf8' });
    } catch (err: any) {
        return `[Error] ${err.message}`;
    }
};

const truncate = (input: string, limit: number = 2000): string =>
    input.length > limit ? input.slice(0, limit) + '\n...[truncated]' : input;

const getGeneralContextTool: Tool = {
    name: "get_general_context",
    description: "Gets a snapshot of the current directory, git branch, staged files, and tree (excluding gitignored files). Call this when starting the session.",
    parameters: {},
    run: async () => {
        const result = {
            currentDirectory: '',
            gitBranch: '',
            stagedFiles: '',
            workingTree: ''
        };

        // Get current directory listing
        try {
            const files = fs.readdirSync(process.cwd()).join('\n');
            result.currentDirectory = truncate(files);
        } catch (err: any) {
            result.currentDirectory = `[Error] Failed to list directory: ${err.message}`;
        }

        // Get current git branch
        result.gitBranch = truncate(execNoThrow('git rev-parse --abbrev-ref HEAD'));

        // Get staged files
        result.stagedFiles = truncate(execNoThrow('git diff --cached --name-only'));

        // Get tree (excluding gitignored)
        result.workingTree = truncate(execNoThrow('git ls-files'));

        return JSON.stringify(result, null, 2);
    }
};

const searchForStringTool: Tool = {
    name: "search_for_string",
    description: "Searches for a string in the current directory using ag or grep, excluding gitignored files.",
    parameters: {
        searchString: "string"
    },
    run: async ({ searchString }) => {
        try {
            // Check if ag is available
            const agAvailable = execNoThrow('command -v ag').trim();
            if (agAvailable) {
                const result = execNoThrow(`ag --ignore .git --ignore node_modules "${searchString}"`);
                return truncate(result);
            }
            // Fallback to grep if ag is not available
            const result = execNoThrow(`grep -r --exclude-dir={.git,node_modules} "${searchString}" .`);
            return truncate(result);
        }
        catch (err: any) {
            return `[Error] Failed to search for string: ${err.message}`;
        }
    }
};

export const searchForPathPatternTool: Tool = {
    name: "search_for_path_pattern",
    description: "Searches for a path pattern in the current directory using ag or grep, excluding gitignored files.",
    parameters: {
        pathPattern: "string"
    },
    run: async ({pathPattern}): Promise<string> => {
        try {
            // Check if ag is available
            const agAvailable = execNoThrow('command -v ag').trim();
            if (agAvailable) {
                const result = execNoThrow(`ag --ignore .git --ignore node_modules "${pathPattern}"`);
                return truncate(result);
            }
            // Fallback to grep if ag is not available
            const result = execNoThrow(`grep -r --exclude-dir={.git,node_modules} "${pathPattern}" .`);
            return truncate(result);
        }
        catch (err: any) {
            return `[Error] Failed to search for path pattern: ${err.message}`;
        }
    }
};

export const contextTools = [
    getGeneralContextTool,
    searchForStringTool,
    searchForPathPatternTool,
];
