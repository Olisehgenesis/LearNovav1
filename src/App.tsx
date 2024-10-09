import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./apps/home";
import QuizzApp from "./apps/quest/Index";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";
import { genAI } from "./lib/genAI";
import QuestBrowser from "./apps/QuestBrowser";
import AttemptQuiz from "./apps/AttemptQuiz";

function App() {
  return (
    <>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<QuizzApp genAI={genAI} />} />
              <Route path="/quests" element={<QuestBrowser />} />
              <Route
                path="/attempt-quiz/:id"
                element={<AttemptQuiz genAI={genAI} />}
              />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </>
  );
}

export default App;
