import type { Question, QuestionTree } from '../types';

export function buildQuestionTree(questions: Question[]): QuestionTree[] {
  const questionMap = new Map<string, QuestionTree>();
  const rootQuestions: QuestionTree[] = [];

  // First pass: create all question nodes
  questions.forEach(q => {
    questionMap.set(q.id, {
      ...q,
      children: []
    });
  });

  // Second pass: build tree structure
  questions.forEach(q => {
    const node = questionMap.get(q.id)!;
    if (q.parent_id) {
      const parent = questionMap.get(q.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootQuestions.push(node);
    }
  });

  // Sort by sort_order
  rootQuestions.sort((a, b) => a.sort_order - b.sort_order);
  questionMap.forEach(node => {
    node.children.sort((a, b) => a.sort_order - b.sort_order);
  });

  return rootQuestions;
}

export function flattenQuestions(questions: QuestionTree[]): Question[] {
  const result: Question[] = [];
  
  function traverse(node: QuestionTree) {
    result.push(node);
    node.children.forEach(child => traverse(child));
  }
  
  questions.forEach(q => traverse(q));
  return result;
}