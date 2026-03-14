import React, { useState } from 'react';
import { showToast } from '../ui/ToastContainer';

export default function Entertainment() {
  const [modalType, setModalType] = useState(null); // 'quiz', 'guess', 'spin', or null
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // --- QUIZ GAME DATA ---
  const quizQuestions = [
    { q: "What is the main ingredient in Hummus?", options: ["Chickpeas", "Lentils", "Beans", "Peas"], correct: 0 },
    { q: "Which country is Pizza originally from?", options: ["Greece", "Italy", "Spain", "France"], correct: 1 },
    { q: "What is the spiciest chili pepper?", options: ["Jalapeño", "Habanero", "Carolina Reaper", "Serrano"], correct: 2 },
    { q: "What is Risotto made of?", options: ["Wheat", "Arborio Rice", "Couscous", "Barley"], correct: 1 },
    { q: "Which herb is used to make Pesto?", options: ["Oregano", "Thyme", "Basil", "Parsley"], correct: 2 }
  ];

  // --- GUESSING GAME DATA ---
  const guessGames = [
    { ingredients: "Tomatoes, mozzarella, basil, olive oil", answer: "Caprese Salad", emoji: "🍅" },
    { ingredients: "Paneer, yogurt, ginger, garlic, spices", answer: "Paneer Tikka", emoji: "🧀" },
    { ingredients: "Eggplant, tomato sauce, cheese, herbs", answer: "Eggplant Parmesan", emoji: "🍆" },
    { ingredients: "Arborio rice, mushrooms, cheese, broth", answer: "Mushroom Risotto", emoji: "🍄" }
  ];

  // --- SPIN REWARDS ---
  const couponRewards = [
    { discount: "10% OFF", color: "#ef4444" },
    { discount: "Free Dessert", color: "#a855f7" },
    { discount: "15% OFF", color: "#3b82f6" },
    { discount: "Free Drinks", color: "#22c55e" },
    { discount: "20% OFF", color: "#eab308" },
    { discount: "Extra Appetizer", color: "#ec4899" },
    { discount: "Free Coffee", color: "#f97316" },
    { discount: "25% OFF", color: "#6366f1" }
  ];

  // Logic Helpers
  const openModal = (type) => {
    setScore(0);
    setCurrentIndex(0);
    setModalType(type);
  };
  
  const closeModal = () => setModalType(null);

  const handleQuizAnswer = (idx) => {
    if (idx === quizQuestions[currentIndex].correct) {
      setScore(s => s + 1);
      showToast('✨ Correct! Great job!', 'success');
    } else {
      showToast('❌ Oops! Try the next one!', 'error');
    }
    setCurrentIndex(i => i + 1);
  };

  const [guessInput, setGuessInput] = useState('');
  const handleGuessSubmit = () => {
    if (guessInput.toLowerCase() === guessGames[currentIndex].answer.toLowerCase()) {
      setScore(s => s + 1);
      showToast('🎯 Perfect! You got it!', 'success');
    } else {
      showToast(`❌ The answer was: ${guessGames[currentIndex].answer}`, 'error');
    }
    setGuessInput('');
    setCurrentIndex(i => i + 1);
  };

  const handleSpin = () => {
    setSpinning(true);
    setTimeout(() => {
      const reward = couponRewards[Math.floor(Math.random() * couponRewards.length)];
      showToast(`🎉 You won: ${reward.discount}! Automatically saved to your account.`, 'success');
      setSpinning(false);
      closeModal();
    }, 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 text-stone-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <p className="text-amber-600 font-medium tracking-widest uppercase mb-2">Entertainment</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900">Never Bored While You Wait!</h2>
          <p className="text-stone-600 mt-4 max-w-xl mx-auto">
            Enjoy interactive games and quizzes while your delicious meal is being prepared
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Quiz Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-shadow fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-40 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <span className="text-6xl">🧠</span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl font-bold mb-2 text-stone-900">Food Quiz Challenge</h3>
              <p className="text-stone-600 mb-6 flex-grow">Test your knowledge about cuisines, ingredients, and culinary facts!</p>
              <button onClick={() => openModal('quiz')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow">
                Play Quiz
              </button>
            </div>
          </div>

          {/* Guess Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-shadow fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-6xl">🍳</span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl font-bold mb-2 text-stone-900">Guess the Dish</h3>
              <p className="text-stone-600 mb-6 flex-grow">Read ingredient descriptions and guess which popular dish it is!</p>
              <button onClick={() => openModal('guess')} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors shadow">
                Play Game
              </button>
            </div>
          </div>

          {/* Spin Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-shadow fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="h-40 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <span className="text-6xl">🎡</span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl font-bold mb-2 text-stone-900">Spin & Win Coupon</h3>
              <p className="text-stone-600 mb-6 flex-grow">Spin the wheel and win exciting discounts on your next visit!</p>
              <button onClick={() => openModal('spin')} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow">
                Spin Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce" style={{ animationIterationCount: 1, animationDuration: '0.4s' }}>
            
            {/* QUIZ MODAL */}
            {modalType === 'quiz' && (
              currentIndex < quizQuestions.length ? (
                <>
                  <div className="mb-6">
                    <p className="text-stone-500 text-sm mb-2 font-bold tracking-wider">QUESTION {currentIndex + 1}/{quizQuestions.length}</p>
                    <h3 className="font-display text-2xl font-bold text-stone-900">{quizQuestions[currentIndex].q}</h3>
                  </div>
                  <div className="space-y-3 mb-6">
                    {quizQuestions[currentIndex].options.map((opt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleQuizAnswer(idx)}
                        className="w-full py-3 px-4 bg-stone-100 hover:bg-green-500 hover:text-white text-stone-800 font-semibold rounded-lg transition-all text-left"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🏆</span>
                  <h3 className="font-display text-3xl font-bold mb-2">Quiz Complete!</h3>
                  <p className="text-2xl font-bold text-green-600 mb-6">{score}/{quizQuestions.length} Correct</p>
                </div>
              )
            )}

            {/* GUESS MODAL */}
            {modalType === 'guess' && (
              currentIndex < guessGames.length ? (
                <div className="text-center">
                  <p className="text-stone-500 text-sm mb-4 font-bold tracking-wider">ROUND {currentIndex + 1}/{guessGames.length}</p>
                  <span className="text-6xl mb-4 block">{guessGames[currentIndex].emoji}</span>
                  <p className="text-stone-600 font-medium mb-4">Ingredients: {guessGames[currentIndex].ingredients}</p>
                  <input 
                    type="text" 
                    value={guessInput}
                    onChange={e => setGuessInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGuessSubmit()}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg mb-4 text-stone-800 focus:border-orange-500 focus:outline-none" 
                    placeholder="Enter your guess..."
                    autoFocus
                  />
                  <div className="flex gap-3 mb-2">
                    <button onClick={handleGuessSubmit} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors">Submit</button>
                    <button onClick={() => { setGuessInput(''); setCurrentIndex(i => i + 1); }} className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg transition-colors">Skip</button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-6xl mb-4 block">👨‍🍳</span>
                  <h3 className="font-display text-3xl font-bold mb-2">Game Over!</h3>
                  <p className="text-2xl font-bold text-orange-600 mb-6">{score}/{guessGames.length} Correct</p>
                </div>
              )
            )}

            {/* SPIN MODAL */}
            {modalType === 'spin' && (
              <div className="text-center">
                <h3 className="font-display text-3xl font-bold text-stone-900 mb-6">🎡 Spin & Win!</h3>
                <div className="w-64 h-64 mx-auto mb-6 relative border-8 border-amber-600 rounded-full bg-amber-50 shadow-inner overflow-hidden flex items-center justify-center">
                  {spinning ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 animate-spin" style={{ animationDuration: '0.2s' }}>
                      <span className="text-5xl mb-2">🎁</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100">
                      <span className="text-5xl mb-2">🎁</span>
                      <span className="font-bold text-stone-500">Ready</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleSpin} 
                  disabled={spinning}
                  className={`w-full py-4 text-white font-bold rounded-lg transition-all text-lg shadow-lg ${spinning ? 'bg-stone-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 transform hover:scale-105'}`}
                >
                  {spinning ? 'Spinning...' : 'Spin Now'}
                </button>
              </div>
            )}

            {/* CLOSE BUTTON */}
            {(!spinning && ((modalType === 'quiz' && currentIndex >= quizQuestions.length) || (modalType === 'guess' && currentIndex >= guessGames.length) || (modalType === 'spin'))) && (
              <button onClick={closeModal} className="w-full py-3 mt-4 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition-colors">
                Back to Entertainment
              </button>
            )}
            {((modalType === 'quiz' && currentIndex < quizQuestions.length) || (modalType === 'guess' && currentIndex < guessGames.length)) && (
               <button onClick={closeModal} className="w-full py-2 mt-4 text-stone-500 hover:text-stone-700 text-sm font-medium">
                 Close Game
               </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
