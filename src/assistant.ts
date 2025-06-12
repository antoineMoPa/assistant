import dotenv from 'dotenv';
import readline from 'readline';
import { OpenAI } from 'openai';
import { handleToolCall, toolsToPromptString } from './tools/index';

dotenv.config();

function askUser(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase());
    });
  });
}

const tools = toolsToPromptString();

const SYSTEM_PROMPT = `
You are a helpful shell assistant.

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

`;

export async function askOpenAI(messages: Array<{ role: string, content: string }>) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages as any,
        temperature: 0
    });

    return response.choices[0].message?.content ?? '';
}

export async function runAssistant() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const history: Array<{ role: string, content: string }> = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        }
    ];

    console.log("🤖 Shell Assistant. Type 'exit' to quit.");


    for await (const line of rl) {
        let shouldContinue = true;

        let input = line.trim();
        if (input === 'exit') {
            console.log("👋 Goodbye!");
            rl.close();
            break;
        }

        while (shouldContinue) {
            shouldContinue = false;

            history.push({ role: 'user', content: input });
            const reply = await askOpenAI(history);
            history.push({ role: 'assistant', content: reply });

            const toolResult = await handleToolCall(reply);
            if (toolResult) {
                shouldContinue = true; // Let the llm continue.
                console.log(`🛠️ Tool Result:\n${toolResult}`);
                history.push({ role: 'user', content: `Tool result:\n${toolResult}` });
                input = "continue using the previous output.";
            } else {
                history.push({ role: 'assistant', content: reply });
            }

            console.log(`🤖 ${reply}`);

        }

        rl.prompt();
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    runAssistant();
}
