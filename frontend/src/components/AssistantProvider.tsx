/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { unstable_RemoteThreadListAdapter as RemoteThreadListAdapter, RuntimeAdapterProvider, useThreadListItem, type ThreadAssistantContentPart, type ThreadHistoryAdapter } from "@assistant-ui/react";
import { AssistantRuntimeProvider, type ChatModelAdapter, type ThreadMessage, useLocalThreadRuntime, MessageStatus } from "@assistant-ui/react";
import { unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime } from "@assistant-ui/react";

import { api } from "@/lib/api";
import { useMemo } from "react";

const MyDatabaseAdapter: RemoteThreadListAdapter = {
  async list() {
    const response = await api.listThreads();
    return {
      threads: response.threads.map((thread) => ({
        status: thread.archived ? ("archived" as const) : ("regular" as const),
        remoteId: thread.ui_thread_id,
        title: thread.title || "New Chat",
      })),
    };
  },

  async initialize(threadId: string) {
    const response = await api.createThread({
      ui_thread_id: threadId,
      title: "New Chat",
    });
    return { 
      remoteId: response.ui_thread_id,
      externalId: response.ui_thread_id
    };
  },

  async rename(remoteId: string, newTitle: string) {
    await api.updateThread({
      ui_thread_id: remoteId,
      title: newTitle,
    });
  },

  async archive(remoteId: string) {
    await api.updateThread({
      ui_thread_id: remoteId,
      archived: true,
    });
  },

  async unarchive(remoteId: string) {
    await api.updateThread({
      ui_thread_id: remoteId,
      archived: false,
    });
  },

  async delete(remoteId: string) {
    // Note: The current API doesn't have a delete method for threads
    // You might need to add this to your backend API
    // For now, we'll archive the thread instead
    await api.updateThread({
      ui_thread_id: remoteId,
      archived: true,
    });
  },

  async generateTitle(remoteId: string, messages: readonly ThreadMessage[]) {
    // This should generate a title based on the conversation
    // Since we don't have a specific API for this, we'll create a simple title
    // and update the thread. In a real implementation, you'd want to use AI to generate this.
    let title = "New Chat";
    
    if (messages.length > 0) {
      const firstMessage = messages[0];
      if (firstMessage.role === "user" && firstMessage.content.length > 0) {
        const textContent = firstMessage.content.find(c => c.type === "text");
        if (textContent && "text" in textContent) {
          title = `Chat about ${textContent.text.substring(0, 30)}...`;
        }
      }
    }
    
    await api.updateThread({
      ui_thread_id: remoteId,
      title: title,
    });

    // Return an empty stream as required by the interface
    return new ReadableStream({
      start(controller) {
        controller.close();
      }
    });
  },
};

const filterToolCalls = (messages: ThreadMessage[]) => {
  return messages.map(message => {
    if (!message.content || !Array.isArray(message.content)) {
      return message;
    }

    // Group tool calls by their ID
    const toolCallsById: Record<string, Array<any>> = {};
    
    // Separate tool calls from other content
    const toolCalls: any[] = [];
    const otherContent: any[] = [];
    
    message.content.forEach(item => {
      if (item.type === 'tool-call' && 'toolCallId' in item) {
        const id = item.toolCallId;
        if (!toolCallsById[id]) {
          toolCallsById[id] = [];
        }
        toolCallsById[id].push(item);
      } else {
        otherContent.push(item);
      }
    });
    
    // For each tool call ID, keep only the first and last instances
    Object.values(toolCallsById).forEach(calls => {
      if (calls.length > 0) {
        if (calls.length === 1) {
          toolCalls.push(calls[0]);
        } else {
          toolCalls.push(calls[0]); // First call
          toolCalls.push(calls[calls.length - 1]); // Last call
        }
      }
    });
    
    // Create a new content array with the filtered items
    const newContent = [...toolCalls, ...otherContent];
    
    // Return a new message with filtered content
    return {
      ...message,
      content: newContent
    };
  });
};

const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {

    const filteredMessages = filterToolCalls(messages as ThreadMessage[]);

    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: filteredMessages }),
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = "";
    const toolCalls = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });

        const { chunkText, chunkToolCalls } = parseChunk(chunk);
        console.log('chunkText:', chunkText);
        console.log('chunkToolCalls:', chunkToolCalls);

        if (chunkText) {
          content += chunkText;
        }
        
        if (chunkToolCalls.length > 0) {
          toolCalls.push(...chunkToolCalls);
        }

        const currentState = {
          content: [
            ...(toolCalls.length > 0 ? toolCalls : []),
            ...(content ? [{ type: "text", text: content }] : []),
          ],
        };
        console.log('currentState:', currentState);

        yield currentState;
      }
    } finally {
      reader.releaseLock();
    }
  },
}

const parseChunk = (chunk: string) => {
  let text = "";
  const toolCalls = [];
  const chunkItems = chunk.split("\n\n");
  for (const chunkItem of chunkItems) {
    if (chunkItem.trim() === "") {
      continue;
    }
    const json = JSON.parse(chunkItem);
    if (json.type === "text") {
      text += json.text;
    }
    if (json.type === "tool-call") {
      // deserialize the args
      if (json.args) {
        const args = JSON.parse(json.args);
        json.args = args;
      }
      toolCalls.push(json);
    }
  }
  return { chunkText: text, chunkToolCalls: toolCalls };
}


export function AssistantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () => {
      return useLocalThreadRuntime(MyModelAdapter, {});
    },
    adapter: {
      ...MyDatabaseAdapter,
      unstable_Provider: ({ children}) => {
        // This runs in the context of each thread
        const threadListItem = useThreadListItem();
        const remoteId = threadListItem.remoteId;

        // Create thread-specific history adapter
        const history = useMemo<ThreadHistoryAdapter>(
          () => ({
            async load() {
              if (!remoteId) return { messages: [] };
              const messagesResponse = await api.listMessages(remoteId);
              return {
                messages: messagesResponse.messages.map((m, idx) => ({
                  message: {
                    role: m.role,
                    content: m.content as unknown as ThreadAssistantContentPart[],
                    id: m.id,
                    createdAt: new Date(m.created_at),
                    metadata: {
                      custom: {},
                      unstable_state: undefined,
                      unstable_annotations: undefined,
                      unstable_data: undefined,
                      steps: undefined,
                    },
                    status: {
                      type: "complete",
                      reason: "stop",
                    } satisfies MessageStatus,
                  },
                  parentId: idx > 0 ? messagesResponse.messages[idx - 1]!.id : null,
                })),
              };
            },
            async append(message) {
              if (!remoteId) {
                console.warn("Cannot save message - thread not initialized");
                
                return;
              }

              await api.createMessage({
                thread_id: remoteId,
                role: message.message.role,
                content: message.message.content,
                ui_message_id: message.message.id,
              });
            },
          }),
          [remoteId],
        );
        const adapters = useMemo(() => ({ history }), [history]);

        return (
          <RuntimeAdapterProvider adapters={adapters}>
            {children}
          </RuntimeAdapterProvider>
        );
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
} 