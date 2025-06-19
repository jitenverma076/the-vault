import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [locksLeft, setLocksLeft] = useState(3)
  const [sequenceInput, setSequenceInput] = useState([])
  const [patternInput, setPatternInput] = useState([])
  const [timingIndex, setTimingIndex] = useState(0)
  const [memoryInput, setMemoryInput] = useState([])
  const [memoryPattern, setMemoryPattern] = useState([])
  const [showMemory, setShowMemory] = useState(false)
  const [readyForMemoryInput, setReadyForMemoryInput] = useState(false)
  const sequenceRef = useRef(['a', 'b', 'arrowleft', 'q'])
  const timingRef = useRef(null)
  const hasShownMemory = useRef(false)

  useEffect(() => {
    const handleKey = e => {
      const key = e.key.toLowerCase()

      // Lock 1: Sequence
      if (locksLeft === 3) {
        const current = [...sequenceInput, key]
        if (key === sequenceRef.current[sequenceInput.length]) {
          if (current.length === sequenceRef.current.length) {
            setLocksLeft(2)
            setSequenceInput([])
          } else {
            setSequenceInput(current)
          }
        } else {
          setSequenceInput([])
        }
        return
      }

      // Lock 2: Timing Lock
      if (locksLeft === 2 && e.code === 'Space') {
        const now = performance.now()
        if (!timingRef.current) timingRef.current = now
        const diff = now - timingRef.current

        if (diff >= 700 && diff <= 1300) {
          setTimingIndex(prev => {
            const next = prev + 1
            if (next === 5) {
              setLocksLeft(1)
              setTimingIndex(0)
              timingRef.current = null
            }
            return next
          })
        } else {
          setTimingIndex(0)
        }

        timingRef.current = now
        return
      }

      // Lock 3: Memory Lock
      if (locksLeft === 1 && readyForMemoryInput) {
        const current = [...memoryInput, key]
        setMemoryInput(current)

        if (current.length === memoryPattern.length) {
          const isCorrect = memoryPattern.every((val, i) => val === current[i])
          if (isCorrect) {
            setLocksLeft(0)
          } else {
            setMemoryInput([])
          }
        }
        return
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [locksLeft, sequenceInput, memoryInput, memoryPattern, readyForMemoryInput])

  useEffect(() => {
    if (locksLeft === 1 && !hasShownMemory.current) {
      const generated = ['j', 'k', 'l']
      setMemoryPattern(generated)
      setShowMemory(true)
      hasShownMemory.current = true

      const timer = setTimeout(() => {
        setShowMemory(false)
        setReadyForMemoryInput(true)
        setMemoryInput([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [locksLeft])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="text-5xl">🔒</div>
      <div className="text-3xl font-semibold">Locks Remaining: {locksLeft}</div>
      <div className="border rounded-md p-6 w-full max-w-xl min-h-[6rem] text-lg">
        {locksLeft === 3 && (
          <div>
            Enter the sequence: A B ← Q
            <div className="mt-2 text-base">Progress: {sequenceInput.length}/4</div>
          </div>
        )}
        {locksLeft === 2 && (
          <div>
            Press Space every 1 second for 5 rounds
            <div className="mt-2 text-base">Correct presses: {timingIndex}/5</div>
          </div>
        )}
        {locksLeft === 1 && showMemory && <div>Remember this sequence: {memoryPattern.join(' ')}</div>}
        {locksLeft === 1 && !showMemory && <div>Now type the sequence</div>}
        {locksLeft === 0 && <div>✅ Vault Unlocked</div>}
      </div>
    </div>
  )
}

export default App