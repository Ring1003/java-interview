import type { Question, QuestionTree } from '../types';
import { buildQuestionTree } from '../utils/tree';

const API_BASE = '';

export async function fetchQuestions(category?: string): Promise<Question[]> {
  const url = category 
    ? `${API_BASE}/api/questions?category=${category}`
    : `${API_BASE}/api/questions`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
}

export async function fetchQuestionTrees(category?: string): Promise<QuestionTree[]> {
  const questions = await fetchQuestions(category);
  return buildQuestionTree(questions);
}

export async function fetchAllQuestionTrees(): Promise<QuestionTree[]> {
  // Fetch all categories in parallel
  const categories = ['java-basics', 'concurrency', 'jvm', 'spring', 'mysql', 'redis', 'algorithm', 'distributed'];
  
  const results = await Promise.all(
    categories.map(cat => fetchQuestions(cat).catch(() => [] as Question[]))
  );
  
  const allQuestions = results.flat();
  return buildQuestionTree(allQuestions);
}

export async function fetchQuestionStats(): Promise<{ total: number }> {
  const response = await fetch(`${API_BASE}/api/questions?limit=1`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  const questions = await response.json();
  return { total: questions.length };
}
