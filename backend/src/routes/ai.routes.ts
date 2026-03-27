import { Hono } from 'hono';
import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

const aiRoutes = new Hono();

aiRoutes.post('/chat', catchAsync(async (c) => {
  const body = await c.req.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    throw new ApiError(400, 'Messages are required and must be an array');
  }

  const llm = new Llm({ 
    provider: (process.env.LLM_PROVIDER as LlmProvider) || LlmProvider.Google 
  });

  const systemPrompt = {
    role: 'system',
    content: `You are a helpful personal finance assistant. 
    You help users manage their budgets, track transactions, and reach their savings goals. 
    Provide concise, actionable financial advice based on the user's queries.
    Focus on helping them save money and stay within their budget.`
  };

  const result = await llm.createStream({
    messages: [systemPrompt, ...messages],
    model: process.env.LLM_MODEL,
  });

  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  return c.body(result.data);
}));

export default aiRoutes;
