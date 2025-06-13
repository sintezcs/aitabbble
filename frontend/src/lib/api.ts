import { CalculateRequest, CalculateResponse } from '@/types/spreadsheet';
import {
  ThreadCreateRequest,
  ThreadUpdateRequest,
  ThreadCreateUpdateResponse,
  ThreadListResponse,
  MessageCreateRequest,
  MessageCreateUpdateResponse,
  MessageListResponse,
} from '@/types/chat';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// API functions
export async function calculateFormula(request: CalculateRequest): Promise<CalculateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Check for empty or null results
    if (
      result.result === null || 
      result.result === undefined || 
      result.result === '' || 
      result.result === 'null' ||
      result.result === 'undefined'
    ) {
      throw new ApiError('The formula didn\'t produce a valid result. Please try modifying your formula.');
    }

    return result;
  } catch {
    throw new ApiError('We\'re having temporary problems. Please try again.');
  }
}

// Thread API functions
export async function createThread(request: ThreadCreateRequest): Promise<ThreadCreateUpdateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/thread`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create thread');
    }

    const result = await response.json();
    return result;
  } catch {
    throw new ApiError('Failed to create thread. Please try again.');
  }
}

export async function updateThread(request: ThreadUpdateRequest): Promise<ThreadCreateUpdateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/thread`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update thread');
    }

    const result = await response.json();
    return result;
  } catch {
    throw new ApiError('Failed to update thread. Please try again.');
  }
}

export async function listThreads(): Promise<ThreadListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/threads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch threads');
    }

    const result = await response.json();
    return result;
  } catch {
    throw new ApiError('Failed to fetch threads. Please try again.');
  }
}

// Message API functions
export async function createMessage(request: MessageCreateRequest): Promise<MessageCreateUpdateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create message');
    }

    const result = await response.json();
    return result;
  } catch {
    throw new ApiError('Failed to create message. Please try again.');
  }
}

export async function listMessages(threadId: string): Promise<MessageListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages?thread_id=${encodeURIComponent(threadId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const result = await response.json();
    return result;
  } catch {
    throw new ApiError('Failed to fetch messages. Please try again.');
  }
}

// Add more API functions here as needed
export const api = {
  calculateFormula,
  createThread,
  updateThread,
  listThreads,
  createMessage,
  listMessages,
  // Future API methods can be added here
}; 