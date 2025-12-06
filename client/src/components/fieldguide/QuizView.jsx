import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button, Card } from '../ui';

export function QuizView({ quiz, moduleId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const questions = quiz.questions || [];
  const passingScore = quiz.passing_score || 0.8;

  const handleAnswer = (questionId, answer) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) correct++;
    });
    return { correct, total: questions.length, percentage: correct / questions.length };
  };

  const score = calculateScore();
  const passed = score.percentage >= passingScore;

  if (showResults) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {passed ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600">Passed!</h2>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600">Not Quite</h2>
            </>
          )}
          <p className="text-3xl font-bold text-charcoal mt-4">
            {score.correct} / {score.total}
          </p>
          <p className="text-gray-500">
            {Math.round(score.percentage * 100)}% (Need {Math.round(passingScore * 100)}% to pass)
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((q, idx) => {
            const isCorrect = answers[q.id] === q.answer;
            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg border ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-charcoal">
                      Q{idx + 1}: {q.question}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className="text-red-600">{answers[q.id]}</span> |
                        Correct: <span className="text-green-600">{q.answer}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-charcoal transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">
          {question.question}
        </h3>

        <div className="space-y-2">
          {question.choices.map((choice) => {
            const letter = choice.charAt(0);
            const isSelected = answers[question.id] === letter;
            return (
              <button
                key={choice}
                onClick={() => handleAnswer(question.id, letter)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Question dots */}
      <div className="flex justify-center gap-1 mt-6">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(idx)}
            className={`w-3 h-3 rounded-full transition-colors ${
              idx === currentQuestion
                ? 'bg-charcoal'
                : answers[q.id]
                ? 'bg-green-400'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
