import { Tool } from './types';
import { readFileTool, listFilesTool } from './fileTools';

export const toolRegistry: Tool[] = [
    readFileTool,
    listFilesTool,
];

export function toolsToPromptString(): string {
    return toolRegistry.map(tool => {
        const paramList = Object.entries(tool.parameters)
            .map(([key, type]) => `${key}: ${type}`)
            .join(', ');
        return `- ${tool.name}: ${tool.description}. Params: ${paramList}`;
    }).join('\n');
}

export function parseToolCall(text: string): { tool: Tool, args: Record<string, string> } | null {
    const match = text.match(/<tool name="(.*?)">(.*?)<\/tool>/s);
    if (!match) return null;

    const [, name, argStr] = match;
    const tool = toolRegistry.find(t => t.name === name);
    if (!tool) return null;

    try {
        const args = JSON.parse(argStr);
        return { tool, args };
    } catch {
        return null;
    }
}

export async function handleToolCall(response: string): Promise<string | null> {
    const parsed = parseToolCall(response);
    if (!parsed) return null;

    return await parsed.tool.run(parsed.args);
}
