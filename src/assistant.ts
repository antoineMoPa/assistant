import dotenv from 'dotenv';
import readline from 'readline';
import { OpenAI } from 'openai';

dotenv.config();

export async function askOpenAI(messages: Array<{ role: string, content: string }>) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
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
            content: "You are a helpful shell assistant."
        }
    ];

    console.log("🤖 Shell Assistant. Type 'exit' to quit.");

    for await (const line of rl) {
        const input = line.trim();
        if (input === 'exit') {
            console.log("👋 Goodbye!");
            rl.close();
            break;
        }

        history.push({ role: 'user', content: input });
        const reply = await askOpenAI(history);
        history.push({ role: 'assistant', content: reply });

        console.log(`🤖 ${reply}`);
        rl.prompt();
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    runAssistant();
}
