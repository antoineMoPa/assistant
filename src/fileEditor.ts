import fs from 'fs';

export type EditCommand = {
    filepath: string;
    mode: 'replace' | 'append' | 'prepend';
    content: string;
};

export function parseEditResponse(response: string): EditCommand | null {
    const match = response.match(/<edit filepath="(.*?)" mode="(.*?)">(.*?)<\/edit>/s);
    if (!match) return null;

    const [, filepath, mode, content] = match;
    if (!['replace', 'append', 'prepend'].includes(mode)) return null;

    return {
        filepath,
        mode: mode as 'replace' | 'append' | 'prepend',
        content: content.trim()
    };
}

export async function applyEdit({ filepath, mode, content }: EditCommand) {
    let finalContent = content;

    try {
        const existing = fs.readFileSync(filepath, 'utf8');

        if (mode === 'append') {
            finalContent = existing + '\n' + content;
        } else if (mode === 'prepend') {
            finalContent = content + '\n' + existing;
        }
    } catch (e) {
        if (mode !== 'replace') {
            console.warn(`[Warning] File doesn't exist. Creating new one.`);
        }
    }

    fs.writeFileSync(filepath, finalContent, 'utf8');
    console.log(`✅ File edited: ${filepath}`);
}
