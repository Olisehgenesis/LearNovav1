import React from 'react';

interface ResultsProps {
    results: {
        score: number;
        feedback: string;
        questionFeedback: Array<{
            id: number;
            correct: boolean;
            feedback: string;
        }>;
    };
    quizData: {
        questions: Array<{
            text: string;
        }>;
    };
}

const Results: React.FC<ResultsProps> = ({ results, quizData }) => {
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
            <p className="text-xl mb-4">Your score: {results.score}%</p>
            <p className="mb-6">{results.feedback}</p>
            <h3 className="text-xl font-semibold mb-4">Question Feedback:</h3>
            <ul className="space-y-4">
                {results.questionFeedback.map((feedback, index) => (
                    <li key={feedback.id} className={`p-4 rounded-lg ${feedback.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p className="font-semibold">{quizData.questions[index].text}</p>
                        <p>{feedback.feedback}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Results;