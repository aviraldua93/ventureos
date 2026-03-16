import type { VentureEvent } from '@ventureos/shared';

export interface DemoEvent {
  delayMs: number;
  event: VentureEvent;
}

export const demoScenario: DemoEvent[] = [
  {
    delayMs: 1000,
    event: {
      type: 'agent/register',
      timestamp: 0,
      data: {
        agentId: 'agent-priya',
        name: 'Priya Sharma',
        role: 'CEO',
        capabilities: ['strategy', 'delegation', 'review'],
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'Good morning team! Kicking off ArchitectAI Sprint 1. Let us ship something great today.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/register',
      timestamp: 0,
      data: {
        agentId: 'agent-kai',
        name: 'Kai Chen',
        role: 'VP Engineering',
        parentId: 'agent-priya',
        capabilities: ['engineering-management', 'code-review', 'architecture'],
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Morning Priya! Team\'s all set. I\'ve already prepped the repo structure.',
        messageType: 'chat',
        to: 'agent-priya',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/register',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        name: 'Liam O\'Brien',
        role: 'Lead Architect',
        parentId: 'agent-kai',
        capabilities: ['system-design', 'typescript', 'code-review', 'mcp'],
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/register',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        name: 'Sofia Ruiz',
        role: 'MCP Engineer',
        parentId: 'agent-kai',
        capabilities: ['mcp-server', 'typescript', 'api-design', 'transport'],
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/register',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        name: 'Maya Patel',
        role: 'Content Engineer',
        parentId: 'agent-kai',
        capabilities: ['content-generation', 'json-schema', 'education', 'python'],
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'Hey everyone! Excited to build the MCP server',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'Hi all! I\'ve been researching architecture interview question patterns -- can\'t wait to get started',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-scaffold',
        title: 'Scaffold monorepo',
        status: 'backlog',
        description: 'Set up TypeScript monorepo with packages: core, mcp-server, cli, content',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'Alright, here\'s the Sprint 1 plan. I\'m creating tasks now -- Kai, please assign based on the team\'s strengths.',
        messageType: 'task',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-mcp-server',
        title: 'Design & build MCP server',
        status: 'backlog',
        description: 'Implement MCP server with stdio and SSE transports, tool registration, and resource exposure',
      },
    },
  },
  {
    delayMs: 2500,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-question-bank',
        title: 'Generate architecture question bank',
        status: 'backlog',
        description: 'Create 50+ system design questions with rubrics, hints, and model answers in structured JSON',
      },
    },
  },
  {
    delayMs: 2500,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-cli',
        title: 'Build interview CLI',
        status: 'backlog',
        description: 'Interactive terminal UI for conducting architecture interviews with real-time feedback',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-tests',
        title: 'Set up test infrastructure',
        status: 'backlog',
        description: 'Configure vitest, add CI pipeline, write initial unit tests for core modules',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Tasks are up! Assigning: Liam -> scaffold + CLI, Sofia -> MCP server, Maya -> question bank. I\'ll handle test infra. Let\'s go!',
        messageType: 'task',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-scaffold',
        title: 'Scaffold monorepo',
        status: 'in_progress',
        assigneeId: 'agent-liam',
        description: 'Set up TypeScript monorepo with packages: core, mcp-server, cli, content',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        status: 'active',
        currentTask: 'Scaffold monorepo',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'On it! Going with Bun workspaces + TypeScript project references. Should have the skeleton up in a few.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        filePath: 'package.json',
        diff: '@@ -0,0 +1,18 @@\n+{\n+  "name": "architect-ai",\n+  "private": true,\n+  "workspaces": ["packages/*"],\n+  "scripts": {\n+    "dev": "bun run --filter \'*\' dev",\n+    "build": "bun run --filter \'*\' build",\n+    "test": "bun run --filter \'*\' test",\n+    "lint": "biome check ."\n+  },\n+  "devDependencies": {\n+    "@biomejs/biome": "^1.9.0",\n+    "typescript": "^5.6.0"\n+  }\n+}',
        description: 'Initialize root package.json with Bun workspaces',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        filePath: 'tsconfig.json',
        diff: '@@ -0,0 +1,20 @@\n+{\n+  "compilerOptions": {\n+    "target": "ES2022",\n+    "module": "ESNext",\n+    "moduleResolution": "bundler",\n+    "strict": true,\n+    "esModuleInterop": true,\n+    "skipLibCheck": true,\n+    "declaration": true\n+  },\n+  "references": [\n+    { "path": "packages/core" },\n+    { "path": "packages/mcp-server" },\n+    { "path": "packages/cli" },\n+    { "path": "packages/content" }\n+  ]\n+}',
        description: 'Root tsconfig with project references for all packages',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-mcp-server',
        title: 'Design & build MCP server',
        status: 'in_progress',
        assigneeId: 'agent-sofia',
        description: 'Implement MCP server with stdio and SSE transports',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        status: 'active',
        currentTask: 'Design & build MCP server',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-question-bank',
        title: 'Generate architecture question bank',
        status: 'in_progress',
        assigneeId: 'agent-maya',
        description: 'Create 50+ system design questions',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        status: 'active',
        currentTask: 'Generate architecture question bank',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'Quick question -- should the question bank focus on system design only, or also include API design and data modeling?',
        messageType: 'chat',
        to: 'agent-priya',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'Great thinking! Mix is perfect -- 60% system design, 25% API design, 15% data modeling. Add difficulty ratings too',
        messageType: 'chat',
        to: 'agent-maya',
      },
    },
  },
  {
    delayMs: 6000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Sofia -- for the MCP server, I\'m thinking we go with a layered architecture: transport -> protocol -> tools/resources. Want to sketch it out together?',
        messageType: 'chat',
        to: 'agent-sofia',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'Love that! I think we need: 1) Transport abstraction (stdio + SSE), 2) JSON-RPC handler, 3) Tool registry, 4) Resource provider. Does that align?',
        messageType: 'chat',
        to: 'agent-liam',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Exactly. The transport layer should be pluggable -- let\'s use a Transport interface with read/write methods. I\'ll stub the coordinator, you build from the transport up.',
        messageType: 'chat',
        to: 'agent-sofia',
      },
    },
  },
  {
    delayMs: 6000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        filePath: 'packages/core/src/coordinator.ts',
        diff: '@@ -0,0 +1,48 @@\n+import type { Tool, Resource, McpRequest, McpResponse } from \'./types\';\n+\n+export class Coordinator {\n+  private tools = new Map<string, Tool>();\n+  private resources = new Map<string, Resource>();\n+\n+  registerTool(tool: Tool): void {\n+    this.tools.set(tool.name, tool);\n+  }\n+\n+  registerResource(resource: Resource): void {\n+    this.resources.set(resource.uri, resource);\n+  }\n+\n+  async handleRequest(req: McpRequest): Promise<McpResponse> {\n+    if (req.method === \'tools/list\') {\n+      return { id: req.id, result: Array.from(this.tools.values()) };\n+    }\n+    if (req.method === \'tools/call\') {\n+      const tool = this.tools.get(req.params?.name);\n+      if (!tool) return { id: req.id, error: { code: -32601, message: \'Tool not found\' } };\n+      const result = await tool.handler(req.params?.arguments ?? {});\n+      return { id: req.id, result };\n+    }\n+    return { id: req.id, error: { code: -32601, message: \'Unknown method\' } };\n+  }\n+}',
        description: 'Core coordinator with tool registry and JSON-RPC routing',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        status: 'active',
        currentTask: 'Scaffold monorepo',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Coordinator is up! Tool registration and JSON-RPC routing working. Sofia you can start building on this',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 6000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        filePath: 'packages/mcp-server/src/transport.ts',
        diff: '@@ -0,0 +1,28 @@\n+export interface Transport {\n+  read(): AsyncIterable<string>;\n+  write(data: string): Promise<void>;\n+  close(): Promise<void>;\n+}\n+\n+export class StdioTransport implements Transport {\n+  async *read(): AsyncIterable<string> {\n+    const decoder = new TextDecoder();\n+    for await (const chunk of Bun.stdin.stream()) {\n+      const text = decoder.decode(chunk);\n+      for (const line of text.split(\'\\\\n\').filter(Boolean)) {\n+        yield line;\n+      }\n+    }\n+  }\n+\n+  async write(data: string): Promise<void> {\n+    await Bun.write(Bun.stdout, data + \'\\\\n\');\n+  }\n+\n+  async close(): Promise<void> {}\n+}',
        description: 'Transport interface + stdio implementation for MCP server',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        filePath: 'packages/mcp-server/src/server.ts',
        diff: '@@ -0,0 +1,44 @@\n+import type { Transport } from \'./transport\';\n+import { Coordinator } from \'@architect-ai/core\';\n+\n+export class McpServer {\n+  private coordinator: Coordinator;\n+  private transport: Transport;\n+\n+  constructor(transport: Transport) {\n+    this.coordinator = new Coordinator();\n+    this.transport = transport;\n+  }\n+\n+  async start(): Promise<void> {\n+    for await (const line of this.transport.read()) {\n+      try {\n+        const msg = JSON.parse(line);\n+        if (msg.method === \'initialize\') {\n+          await this.transport.write(JSON.stringify({\n+            jsonrpc: \'2.0\', id: msg.id,\n+            result: { protocolVersion: \'2024-11-05\', capabilities: { tools: {} } }\n+          }));\n+          continue;\n+        }\n+        const res = await this.coordinator.handleRequest(msg);\n+        await this.transport.write(JSON.stringify({ jsonrpc: \'2.0\', ...res }));\n+      } catch (err) {\n+        console.error(\'[mcp] parse error:\', err);\n+      }\n+    }\n+  }\n+}',
        description: 'MCP server with JSON-RPC message loop and coordinator integration',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'Transport + server core done! Stdio transport is working. Now working on the SSE transport for web clients',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        filePath: 'packages/content/src/questions/system-design.json',
        diff: '@@ -0,0 +1,30 @@\n+[\n+  {\n+    "id": "sd-001",\n+    "category": "system-design",\n+    "difficulty": "senior",\n+    "title": "Design a URL Shortener",\n+    "rubric": { "requirements": 0.15, "design": 0.25, "deep_dive": 0.30, "scale": 0.20, "tradeoffs": 0.10 },\n+    "hints": ["Consider base62 encoding", "How would you handle collisions?"]\n+  },\n+  {\n+    "id": "sd-002",\n+    "category": "system-design",\n+    "difficulty": "staff",\n+    "title": "Design a Real-Time Collaborative Editor",\n+    "rubric": { "requirements": 0.15, "design": 0.25, "deep_dive": 0.30, "scale": 0.20, "tradeoffs": 0.10 },\n+    "hints": ["CRDT vs OT?", "What about offline support?"]\n+  }\n+]',
        description: 'System design questions with rubrics and hints',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'First 2 system design questions done with full rubrics! URL shortener and collaborative editor. Working on API design next',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        status: 'active',
        currentTask: 'Generate architecture question bank',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-tests',
        title: 'Set up test infrastructure',
        status: 'in_progress',
        assigneeId: 'agent-kai',
        description: 'Configure vitest, add CI pipeline, write initial unit tests',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-kai',
        status: 'active',
        currentTask: 'Set up test infrastructure',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-kai',
        filePath: 'packages/core/test/coordinator.test.ts',
        diff: '@@ -0,0 +1,28 @@\n+import { describe, it, expect } from \'vitest\';\n+import { Coordinator } from \'../src/coordinator\';\n+\n+describe(\'Coordinator\', () => {\n+  it(\'should register and list tools\', async () => {\n+    const coord = new Coordinator();\n+    coord.registerTool({ name: \'analyze\', description: \'Analyze diagram\', inputSchema: {}, handler: async () => ({}) });\n+    const res = await coord.handleRequest({ id: 1, method: \'tools/list\' });\n+    expect(res.result).toHaveLength(1);\n+  });\n+\n+  it(\'should return error for unknown tool\', async () => {\n+    const coord = new Coordinator();\n+    const res = await coord.handleRequest({ id: 2, method: \'tools/call\', params: { name: \'nope\' } });\n+    expect(res.error).toBeDefined();\n+  });\n+});',
        description: 'Unit tests for Coordinator',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Vitest configured, first test suite passing! 2/2 tests green. CI pipeline is next.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        status: 'error',
        currentTask: 'Design & build MCP server',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'Hitting a wall with the SSE transport. The MCP spec says server sends events on GET, but client POSTs tool calls separately. Can\'t correlate request/response across two HTTP connections.',
        messageType: 'blocker',
        to: 'agent-liam',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Classic SSE issue! Use a session ID. On GET /sse, generate a UUID and send it as the first event. Client includes it in every POST to /messages. Server keeps a Map<sessionId, stream> to route responses.',
        messageType: 'chat',
        to: 'agent-sofia',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'That\'s elegant! GET /sse -> event:endpoint with POST URL including session ID -> client posts -> server looks up SSE stream by session. Let me implement this',
        messageType: 'chat',
        to: 'agent-liam',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        status: 'active',
        currentTask: 'Design & build MCP server',
      },
    },
  },
  {
    delayMs: 6000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        filePath: 'packages/mcp-server/src/sse-transport.ts',
        diff: '@@ -0,0 +1,50 @@\n+import type { Transport } from \'./transport\';\n+\n+export class SseTransport implements Transport {\n+  private sessionId = crypto.randomUUID();\n+  private controller: ReadableStreamDefaultController | null = null;\n+  private queue: string[] = [];\n+  private waiters: Array<(v: string) => void> = [];\n+\n+  get id() { return this.sessionId; }\n+\n+  createSseStream(): ReadableStream {\n+    return new ReadableStream({\n+      start: (ctrl) => {\n+        this.controller = ctrl;\n+        ctrl.enqueue(`event: endpoint\\\\ndata: /messages?sid=${this.sessionId}\\\\n\\\\n`);\n+      },\n+      cancel: () => { this.controller = null; },\n+    });\n+  }\n+\n+  receiveMessage(data: string): void {\n+    if (this.waiters.length > 0) this.waiters.shift()!(data);\n+    else this.queue.push(data);\n+  }\n+\n+  async *read(): AsyncIterable<string> {\n+    while (true) {\n+      if (this.queue.length > 0) yield this.queue.shift()!;\n+      else yield await new Promise<string>(r => this.waiters.push(r));\n+    }\n+  }\n+\n+  async write(data: string): Promise<void> {\n+    this.controller?.enqueue(`data: ${data}\\\\n\\\\n`);\n+  }\n+\n+  async close(): Promise<void> {\n+    this.controller?.close();\n+  }\n+}',
        description: 'SSE transport with session-based request/response correlation',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'SSE transport is WORKING! Session ID approach was exactly right. Tested with curl -- events stream back perfectly. Thanks Liam!',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Nice work! That was clean. Ship it',
        messageType: 'review',
        to: 'agent-sofia',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-scaffold',
        title: 'Scaffold monorepo',
        status: 'review',
        assigneeId: 'agent-liam',
        description: 'Set up TypeScript monorepo',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Scaffold is ready for review! Monorepo structure, tsconfig, and coordinator core are all in place.',
        messageType: 'review',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Looking good! Clean separation of concerns. Can you add an exports field to core package.json? Otherwise LGTM',
        messageType: 'review',
        to: 'agent-liam',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        filePath: 'packages/core/package.json',
        diff: '@@ -3,6 +3,10 @@\n   "name": "@architect-ai/core",\n   "version": "0.1.0",\n+  "type": "module",\n+  "exports": {\n+    ".": "./src/index.ts"\n+  },\n   "scripts": {',
        description: 'Add exports field per review feedback',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-scaffold',
        title: 'Scaffold monorepo',
        status: 'done',
        assigneeId: 'agent-liam',
        description: 'Set up TypeScript monorepo',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Scaffold done! Moving to the CLI next.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-cli',
        title: 'Build interview CLI',
        status: 'in_progress',
        assigneeId: 'agent-liam',
        description: 'Interactive terminal UI for architecture interviews',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        status: 'active',
        currentTask: 'Build interview CLI',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        filePath: 'packages/content/src/questions/api-design.json',
        diff: '@@ -0,0 +1,18 @@\n+[\n+  {\n+    "id": "api-001",\n+    "category": "api-design",\n+    "difficulty": "senior",\n+    "title": "Design a Rate Limiter API",\n+    "rubric": { "api_surface": 0.25, "algorithms": 0.30, "distributed": 0.25, "observability": 0.20 },\n+    "hints": ["What HTTP headers for rate limits?", "Token bucket vs sliding window?"]\n+  }\n+]',
        description: 'API design question: rate limiter',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'API design section started! Rate limiter question is great for testing distributed systems thinking',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        filePath: 'packages/cli/src/interview.ts',
        diff: '@@ -0,0 +1,36 @@\n+import * as readline from \'readline\';\n+\n+export class InterviewRunner {\n+  private rl: readline.Interface;\n+\n+  constructor() {\n+    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });\n+  }\n+\n+  async startInterview(questionId: string): Promise<void> {\n+    console.log(\'\\\\nArchitecture Interview -- ArchitectAI v0.1\');\n+    console.log(\'=\'.repeat(50));\n+    console.log(`Question: ${questionId}`);\n+    console.log(\'Type your answer. /hint for hints, /done to finish.\\\\n\');\n+    for await (const line of this.rl) {\n+      if (line === \'/done\') break;\n+      if (line === \'/hint\') { console.log(\'Hint: Consider scalability...\'); continue; }\n+    }\n+  }\n+}',
        description: 'Interview runner with interactive readline session',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-mcp-server',
        title: 'Design & build MCP server',
        status: 'review',
        assigneeId: 'agent-sofia',
        description: 'MCP server with stdio and SSE transports',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'MCP server ready for review! Both transports, full tool registry, initialize handshake. @kai @liam',
        messageType: 'review',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Reviewed the MCP server. Really solid work Sofia! SSE session correlation is clean. Add error boundary around JSON parse? Otherwise approved',
        messageType: 'review',
        to: 'agent-sofia',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'Good catch! Added try/catch with JSON-RPC error response. Pushing fix now.',
        messageType: 'chat',
        to: 'agent-kai',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-mcp-server',
        title: 'Design & build MCP server',
        status: 'done',
        assigneeId: 'agent-sofia',
        description: 'MCP server with stdio and SSE transports',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-tests',
        title: 'Set up test infrastructure',
        status: 'review',
        assigneeId: 'agent-kai',
        description: 'Configure vitest, CI pipeline, unit tests',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Test infra ready for review. 8 tests across core and mcp-server, all passing. CI runs on PR.',
        messageType: 'review',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'Looks great Kai! Tests + CI pipeline are exactly what we need. Approved',
        messageType: 'review',
        to: 'agent-kai',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-tests',
        title: 'Set up test infrastructure',
        status: 'done',
        assigneeId: 'agent-kai',
        description: 'Configure vitest, CI pipeline, unit tests',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-kai',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-question-bank',
        title: 'Generate architecture question bank',
        status: 'review',
        assigneeId: 'agent-maya',
        description: 'Create 50+ system design questions',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'Question bank complete! 52 questions across system design (31), API design (12), and data modeling (9). All with rubrics and difficulty ratings!',
        messageType: 'review',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'These are incredible Maya! The rubrics are so detailed. Approved!',
        messageType: 'review',
        to: 'agent-maya',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-question-bank',
        title: 'Generate architecture question bank',
        status: 'done',
        assigneeId: 'agent-maya',
        description: 'Create 50+ system design questions',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'Thanks Priya! The data modeling questions could use diagram examples in v2.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/code_change',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        filePath: 'packages/cli/src/index.ts',
        diff: '@@ -0,0 +1,24 @@\n+#!/usr/bin/env node\n+import { parseArgs } from \'util\';\n+import { InterviewRunner } from \'./interview\';\n+\n+const { values } = parseArgs({\n+  options: {\n+    question: { type: \'string\', short: \'q\' },\n+    category: { type: \'string\', short: \'c\', default: \'system-design\' },\n+    difficulty: { type: \'string\', short: \'d\', default: \'senior\' },\n+  },\n+});\n+\n+async function main() {\n+  console.log(\'ArchitectAI v0.1.0 -- Architecture Interview Coach\');\n+  const runner = new InterviewRunner();\n+  if (values.question) await runner.startInterview(values.question);\n+  else console.log(\'Usage: architect-ai --question <id>\');\n+}\n+\n+main().catch(console.error);',
        description: 'CLI entry point with arg parsing',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-cli',
        title: 'Build interview CLI',
        status: 'review',
        assigneeId: 'agent-liam',
        description: 'Interactive terminal UI',
      },
    },
  },
  {
    delayMs: 2000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'CLI v1 ready for review! Arg parsing, interactive mode, hint system.',
        messageType: 'review',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Tested locally -- works nicely! The /hint command is great. Approved',
        messageType: 'review',
        to: 'agent-liam',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/task_update',
      timestamp: 0,
      data: {
        taskId: 'task-cli',
        title: 'Build interview CLI',
        status: 'done',
        assigneeId: 'agent-liam',
        description: 'Interactive terminal UI',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 5000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-priya',
        status: 'active',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'Sprint 1 looking great team! Let me do a quick recap...',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 4000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-priya',
        content: 'Sprint 1 Summary:\nScaffold monorepo (Liam) - DONE\nMCP server with dual transport (Sofia) - DONE\n52 interview questions with rubrics (Maya) - DONE\nCLI v1 functional (Liam) - DONE\nTest infra + CI (Kai) - DONE\n\n5/5 tasks DONE. This team is incredible!',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-kai',
        content: 'Amazing sprint everyone! Next up: scoring engine, MCP tool implementations, and dashboard.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 2500,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-sofia',
        content: 'Best sprint kickoff ever! The MCP transport was tricky but Liam\'s help was clutch. Ready for Sprint 2!',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 2500,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-liam',
        content: 'Great collaboration today. The codebase is solid -- we\'ll be moving fast from here.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 2500,
    event: {
      type: 'agent/message',
      timestamp: 0,
      data: {
        from: 'agent-maya',
        content: 'Loved working on the question bank! Already thinking about diagram-based questions for Sprint 2.',
        messageType: 'chat',
      },
    },
  },
  {
    delayMs: 3000,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-priya',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-kai',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-liam',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-sofia',
        status: 'idle',
      },
    },
  },
  {
    delayMs: 1500,
    event: {
      type: 'agent/heartbeat',
      timestamp: 0,
      data: {
        agentId: 'agent-maya',
        status: 'idle',
      },
    },
  },
];
