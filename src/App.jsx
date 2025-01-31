import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "./App.css";

function App() {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const proxyUrl = "https://api.allorigins.win/get?url=";
        const apiUrl = encodeURIComponent("https://api.jsonserve.com/Uw5CrX");
        const response = await fetch(proxyUrl + apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz data");
        }
        const data = await response.json();
        setQuizData(JSON.parse(data.contents).questions);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showScore) {
      const earnedBadges = [];
      if (score === quizData.length) {
        earnedBadges.push("Perfect Score 🏆");
      }
      if (streak >= 3) {
        earnedBadges.push("Streak Master 🔥");
      }
      if (time < 30) {
        earnedBadges.push("Speedster ⚡");
      }
      setBadges(earnedBadges);
    }
  }, [showScore, score, streak, time, quizData.length]);

  const handleAnswerClick = (isCorrect, index) => {
    setSelectedAnswer(index);
    setIsCorrectAnswer(isCorrect);
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrectAnswer(false);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsCorrectAnswer(false);
    setBadges([]);
    setStreak(0);
    setTime(0);
  };

  if (loading) {
    return <div className="loading">Loading quiz data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (quizData.length === 0) {
    return <div className="error">No quiz data available.</div>;
  }

  return (
    <div className="app">
      {showScore && score === quizData.length && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      {showScore ? (
        <div className="score-section">
          <h2>Quiz Completed!</h2>
          <p>
            You scored <span className="score">{score}</span> out of{" "}
            <span className="total">{quizData.length}</span>
          </p>
          {badges.length > 0 && (
            <div className="badges-section">
              <h3>Badges Earned:</h3>
              {badges.map((badge, index) => (
                <div key={index} className="badge">
                  {badge}
                </div>
              ))}
            </div>
          )}
          <button onClick={restartQuiz} className="restart-button">
            Restart Quiz
          </button>
        </div>
      ) : (
        <div className="quiz-section">
          <h1>Quiz Application</h1>
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${((currentQuestion + 1) / quizData.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="question-section">
            <div className="question-count">
              Question {currentQuestion + 1} of {quizData.length}
            </div>
            <div className="question-text">
              {quizData[currentQuestion]?.description}
            </div>
          </div>
          <div className="answer-section">
            {quizData[currentQuestion]?.options?.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleAnswerClick(option.is_correct, index)}
                className={`answer-button ${
                  selectedAnswer === index
                    ? isCorrectAnswer
                      ? "correct"
                      : "incorrect"
                    : ""
                }`}
                disabled={selectedAnswer !== null}
              >
                {option.description}
              </button>
            ))}
          </div>
          {selectedAnswer !== null && (
            <div className="feedback">
              {isCorrectAnswer ? (
                <p className="correct-feedback">Correct! 🎉</p>
              ) : (
                <p className="incorrect-feedback">Incorrect! 😢</p>
              )}
            </div>
          )}
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="next-button"
          >
            Next Question
          </button>
          <div className="streak-section">Current Streak: {streak} 🔥</div>
          <div className="timer-section">Time: {time} seconds</div>
        </div>
      )}
    </div>
  );
}

export default App;
