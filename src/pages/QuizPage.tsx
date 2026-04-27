import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { QuestionCard } from '../components/QuestionCard';
import type { QuestionTree, Category } from '../types';

export function QuizPage() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const { questionTrees, progress, isDarkMode, toggleDarkMode, updateProgress, toggleFavorite, favorites, getRandomQuestions } = useApp();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuestionTree[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [isStarted, setIsStarted] = useState(false);
  
  // 开始新一轮刷题
  const startQuiz = (count: number, cat?: Category) => {
    const questions = getRandomQuestions(count, cat);
    setQuizQuestions(questions);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswers({});
    setIsFinished(false);
    setIsStarted(true);
  };
  
  // 下一题
  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };
  
  // 上一题
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };
  
  // 标记答案正确/错误
  const markAnswer = (questionId: string, result: 'correct' | 'wrong') => {
    setUserAnswers(prev => ({ ...prev, [questionId]: result }));
    updateProgress(questionId, result === 'correct' ? 'mastered' : 'reviewing');
  };
  
  // 计算得分
  const score = useMemo(() => {
    const correct = Object.values(userAnswers).filter(a => a === 'correct').length;
    return correct;
  }, [userAnswers]);
  
  // 结束界面
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {score === quizQuestions.length ? '🎉' : score > quizQuestions.length / 2 ? '👏' : '💪'}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">刷题完成！</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            正确 {score} / {quizQuestions.length} 题
          </p>
          
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
              style={{ width: `${(score / quizQuestions.length) * 100}%` }}
            />
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => startQuiz(questionCount, category as Category)}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              再刷一轮
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 选择界面
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🎯 刷题模式</h1>
            <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            选择答题数量开始刷题，系统会从题库中随机抽取题目
          </p>
          
          {/* 题目数量选择 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[5, 10, 20].map(count => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  questionCount === count
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {count} 题
              </button>
            ))}
          </div>
          
          <button
            onClick={() => startQuiz(questionCount, category as Category)}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            开始刷题
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 py-2 px-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }
  
  // 刷题界面
  const currentQuestion = quizQuestions[currentIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsStarted(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← 退出
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} / {quizQuestions.length}
            </span>
            <DarkModeToggle isDark={isDarkMode} onToggle={toggleDarkMode} />
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Question */}
      <div className="max-w-2xl mx-auto mt-6">
        {currentQuestion && (
          <div className="relative">
            <QuestionCard
              question={currentQuestion}
              currentStatus={progress[currentQuestion.id] || 'unread'}
              isFavorite={favorites.has(currentQuestion.id)}
              onStatusChange={updateProgress}
              onFavoriteClick={toggleFavorite}
            />
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-6 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
          >
            {showAnswer ? '隐藏答案' : '查看答案'}
          </button>
        </div>
        
        {/* Answer evaluation */}
        {showAnswer && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => {
                markAnswer(currentQuestion.id, 'correct');
                nextQuestion();
              }}
              className="px-8 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-all"
            >
              ✓ 我会了
            </button>
            <button
              onClick={() => {
                markAnswer(currentQuestion.id, 'wrong');
                nextQuestion();
              }}
              className="px-8 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
            >
              ✗ 再复习
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
