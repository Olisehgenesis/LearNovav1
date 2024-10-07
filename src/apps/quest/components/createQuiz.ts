import React, { useState } from 'react';
import { useQuizToken } from './useQuizToken';

function CreateQuiz() {
  const [quizData, setQuizData] = useState('');
  const { userBalance, createQuiz } = useQuizToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createQuiz();
      // Here you would typically save the quiz data to your backend
      console.log('Quiz created successfully');
      setQuizData('');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create a New Quiz</h2>
      <p className="mb-4">Your token balance: {userBalance} LNT</p>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 mb-4 border rounded"
          rows={10}
          value={quizData}
          onChange={(e) => setQuizData(e.target.value)}
          placeholder="Enter your quiz data here..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Quiz (50 LNT)
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz;