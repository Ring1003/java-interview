import { getDeviceId } from '../utils/device';

const API_BASE = '';

export interface ProgressData {
  [questionId: string]: 'unread' | 'mastered' | 'reviewing';
}

export interface ProgressStats {
  total: number;
  mastered: number;
  reviewing: number;
  unread: number;
}

export async function fetchProgress(deviceId: string): Promise<ProgressData> {
  const response = await fetch(`${API_BASE}/api/progress/${deviceId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch progress');
  }
  return response.json();
}

export async function updateProgress(
  questionId: string,
  status: 'unread' | 'mastered' | 'reviewing'
): Promise<void> {
  const deviceId = getDeviceId();
  
  const response = await fetch(`${API_BASE}/api/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_id: deviceId,
      question_id: questionId,
      status,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update progress');
  }
}

export async function fetchProgressStats(deviceId: string): Promise<ProgressStats> {
  const response = await fetch(`${API_BASE}/api/progress/${deviceId}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}