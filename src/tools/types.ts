export type Tool = {
    name: string;
    description: string;
    parameters: Record<string, string>; // e.g., { path: "string", mode: "append" }
    run: (args: Record<string, string>) => Promise<string>;
};
