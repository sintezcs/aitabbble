import type { ThreadAssistantContentPart } from "@assistant-ui/react";

// Thread types
export interface ThreadCreateRequest {
  ui_thread_id: string;
  user_id?: string | null;
  title?: string | null;
}

export interface ThreadUpdateRequest {
  ui_thread_id: string;
  title?: string | null;
  archived?: boolean | null;
}

export interface ThreadCreateUpdateResponse {
  id: string;
  ui_thread_id: string;
}

export interface ThreadResponse {
  id: string;
  ui_thread_id: string;
  user_id: string;
  title: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThreadListResponse {
  threads: ThreadResponse[];
}

// Message types
export interface MessageCreateRequest {
  ui_message_id: string;
  thread_id: string;
  role: string;
  content: ThreadAssistantContentPart[];
}

export interface MessageCreateUpdateResponse {
  id: string;
  ui_message_id: string;
}

export interface MessageResponse {
  id: string;
  ui_message_id: string;
  thread_id: string;
  role: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MessageListResponse {
  messages: MessageResponse[];
} 