import { CalculateRequest, CalculateResponse } from '@/types/spreadsheet';

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

// Add more API functions here as needed
export const api = {
  calculateFormula,
  // Future API methods can be added here
}; 