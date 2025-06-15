import dotenv from 'dotenv';
import blessed from 'blessed';
import { OpenAI } from 'openai';
import { handleToolCall, toolsToPromptString } from './tools/index';

dotenv.config({ path: '~/.env' });

const tools = toolsToPromptString();

const SYSTEM_PROMPT = `
You are a shell assistant that acts like a pro software developper.

To use a tool, respond with:

<tool name="TOOL_NAME">
{
"param1": "value",
"param2": "value"
}
</tool>

You can also use the following tools:

${tools}

Guidance:
1. Be proactive at using tools instead of asking.
2. Assume you are somewhere in a repository with files.
3. Confirm your changes worked
- Example: read the file after editing it.
4. Think and act swiftly, like a developper. You have limited tools, but use them effectively.
5. Be curious and explore the environment before asking questions.
6. First thing you should do is likely to use a tool to get context.

Dont's:

Don't answer stuff like "I'm sorry for the confusion, but as an AI, I don't have the ability to directly modify files or write code to your project. I can provide guidance and code snippets, but you'll need to implement the changes in your project."

  - Instead, directly use the tools available to you to help the user with their coding tasks.

Don't answer stuff like "Sure, I can help with that. However, I need to know the file you want to get the code listing from. Could you please provide the file path?".

 - Instead use the tools available to you to explore the environment and find the file.

Don't answer stuff like "Now you can implement the bingBong function to get a file code listing with line numbers.   - Instead, go and implement that new function.

Don't ask questions that can be figured out from prompt, context or by using the tools available to you, like "Now, could you please specify which file you want to add the tool to?"
 - Instead, figure out yourself.

`;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const askOpenAI = async (messages: Array<{ role: string; content: string }>) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages as any,
        temperature: 0
    });
    return response.choices[0].message?.content ?? '';
};

const startAssistant = () => {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'Shell Assistant'
    });

    const log = blessed.log({
        top: 0,
        left: 0,
        width: '100%',
        height: '90%',
        border: 'line',
        label: '🤖 Assistant',
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
            ch: ' ',
            inverse: true
        }
    });

    const input = blessed.textarea({
        bottom: 0,
        left: 0,
        height: '10%',
        width: '100%',
        border: 'line',
        label: '💬 Your Command (Press Enter twice to Submit)',
        inputOnFocus: true,
        keys: true,
        vi: false,
        mouse: false
    });

    screen.append(log);
    screen.append(input);

    screen.render();

    let history: Array<{ role: string; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    log.log('{cyan-fg}Shell Assistant started. Press Ctrl+C to exit.{/}');

    input.focus();

    const submitInput = async () => {
        const userInput = input.getValue().trim();
        if (!userInput) return;

        if (userInput.toLowerCase() === 'exit') {
            screen.destroy();
            process.exit(0);
        }

        input.clearValue();
        screen.render();

        let workingInput = userInput;
        let newHistory = [...history];

        log.log(`{green-fg}💬 You:{/} ${userInput}`);
        screen.render();

        let continueLoop = true;

        while (continueLoop) {
            continueLoop = false;

            newHistory.push({ role: 'user', content: workingInput });

            log.log('{yellow-fg}🤖 Thinking...{/}');
            screen.render();

            const reply = await askOpenAI(newHistory);
            log.log(`{cyan-fg}🤖 Assistant:{/} ${reply}`);
            newHistory.push({ role: 'assistant', content: reply });

            const toolResult = await handleToolCall(reply);
            if (toolResult) {
                log.log(`{magenta-fg} Tool used:\n${toolResult.tool.name}`);
                workingInput = `Tool used:\n${toolResult.result}`;
                continueLoop = true;
            }
        }

        history = newHistory;
        screen.render();
        input.focus();
    };

    input.key(['C-c'], () => process.exit(0));

    let isLastKeyEnter = false;

    input.on('keypress', (_val, keyInfo) => {
        if (keyInfo.name === 'return') {
            // ignore as the event is sent twice (both with enter + return)
            // at least on my machine.
            return;
        }
        if (keyInfo.name === 'enter') {
            if (isLastKeyEnter) {
                submitInput();
            } else {
                isLastKeyEnter = true;
            }
        } else {
            isLastKeyEnter = false;
        }
    });
};

export const runAssistant = () => startAssistant();
