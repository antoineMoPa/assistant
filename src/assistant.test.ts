import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAssistant } from './assistant';
import blessed from 'blessed';
import { OpenAI } from 'openai';

vi.mock('blessed');
vi.mock('openai');

describe('Shell Assistant (TUI)', () => {
    let mockScreen: any;

    beforeEach(() => {
        mockScreen = {
            append: vi.fn(),
            render: vi.fn(),
            destroy: vi.fn(),
        };

        (blessed.screen as any) = vi.fn(() => mockScreen);
        (blessed.log as any) = vi.fn(() => ({
            log: vi.fn()
        }));
        (blessed.textarea as any) = vi.fn(() => ({
            focus: vi.fn(),
            getValue: vi.fn().mockReturnValue('exit'),
            clearValue: vi.fn(),
            on: vi.fn(),
            key: vi.fn()
        }));

        (OpenAI as any).mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn().mockResolvedValue({
                        choices: [{ message: { content: 'Mock response' } }]
                    })
                }
            }
        }));
    });

    it('should initialize blessed screen and UI components', () => {
        runAssistant();
        expect(blessed.screen).toHaveBeenCalled();
        expect(blessed.log).toHaveBeenCalled();
        expect(blessed.textarea).toHaveBeenCalled();
    });
});
