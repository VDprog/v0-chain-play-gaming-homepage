"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HelpCircle, Clock, Check, X } from "lucide-react"
import type { RoomWithPlayers } from "@/lib/types/room"
import type { PlayerWithStats } from "@/lib/types/player"

interface TriviaRoyaleGameProps {
  room: RoomWithPlayers
  player: PlayerWithStats | null
  isSpectator: boolean
}

const sampleQuestions = [
  {
    question: "What is the native token of the Tezos network?",
    options: ["XTZ", "BTC", "SOL", "MATIC"],
    correct: 0,
  },
  {
    question: "Which consensus mechanism does Tezos use?",
    options: ["Proof of Work", "Liquid Proof of Stake", "Delegated Proof of Stake", "Proof of Authority"],
    correct: 1,
  },
  {
    question: "What does NFT stand for?",
    options: ["New File Type", "Non-Fungible Token", "Network File Transfer", "Next Finance Technology"],
    correct: 1,
  },
]

export function TriviaRoyaleGame({ room, player, isSpectator }: TriviaRoyaleGameProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = sampleQuestions[questionIndex]

  useEffect(() => {
    if (showResult) return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, showResult])

  const handleTimeUp = () => {
    setShowResult(true)
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || isSpectator) return
    
    setSelectedAnswer(index)
    setShowResult(true)
    
    if (index === currentQuestion.correct) {
      setScore((prev) => prev + timeLeft * 10)
    }

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const nextQuestion = () => {
    if (questionIndex < sampleQuestions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(15)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold">Trivia Royale</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Q{questionIndex + 1}/{sampleQuestions.length}
          </span>
          <div className="flex items-center gap-2 font-semibold text-primary">
            Score: {score}
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="px-4 py-2 bg-muted/30">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={`text-sm font-medium ${timeLeft <= 5 ? "text-red-500" : ""}`}>
            {timeLeft}s
          </span>
        </div>
        <Progress value={(timeLeft / 15) * 100} className="h-2" />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Question */}
          <div className="text-center mb-8">
            <p className="text-2xl font-bold">{currentQuestion.question}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedAnswer === i
              const isCorrect = i === currentQuestion.correct
              const showCorrect = showResult && isCorrect
              const showWrong = showResult && isSelected && !isCorrect
              
              return (
                <Button
                  key={i}
                  size="lg"
                  variant="outline"
                  disabled={showResult || isSpectator}
                  onClick={() => handleAnswer(i)}
                  className={`h-16 text-lg justify-start gap-3 ${
                    showCorrect 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : showWrong 
                        ? "border-red-500 bg-red-50 text-red-700"
                        : isSelected
                          ? "border-primary bg-primary/5"
                          : ""
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    showCorrect 
                      ? "bg-emerald-500 text-white" 
                      : showWrong 
                        ? "bg-red-500 text-white"
                        : "bg-muted"
                  }`}>
                    {showCorrect ? <Check className="h-4 w-4" /> : showWrong ? <X className="h-4 w-4" /> : String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </Button>
              )
            })}
          </div>

          {/* Result Message */}
          {showResult && selectedAnswer !== null && (
            <div className={`mt-6 p-4 rounded-xl text-center ${
              selectedAnswer === currentQuestion.correct 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {selectedAnswer === currentQuestion.correct 
                ? `Correct! +${timeLeft * 10} points`
                : "Wrong answer!"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
