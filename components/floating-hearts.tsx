"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

interface FloatingHeartsProps {
  count?: number
  colors?: string[]
}

type HeartType = {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

export function FloatingHearts({
  count = 15,
  colors = ["#ff6b6b", "#ff8787", "#fa5252", "#e64980"],
}: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<HeartType[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    // Only run this effect once on component mount
    if (!initialized.current) {
      initialized.current = true

      const newHearts: HeartType[] = []
      for (let i = 0; i < count; i++) {
        newHearts.push({
          id: i,
          x: Math.random() * 100, // 0 to 100%
          y: 110 + Math.random() * 20, // Start below screen
          size: Math.random() * 1.5 + 0.5, // 0.5 to 2
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * 10 + 10, // 10 to 20 seconds
          delay: Math.random() * 10, // 0 to 10 seconds
        })
      }
      setHearts(newHearts)
    }
  }, []) // Empty dependency array ensures this runs only once

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{
            x: `${heart.x}vw`,
            y: `${heart.y}vh`,
            opacity: 0,
          }}
          animate={{
            y: "-20vh",
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 5,
          }}
          style={{
            position: "absolute",
            color: heart.color,
            transform: `scale(${heart.size})`,
          }}
        >
          <Heart className="h-6 w-6" fill="currentColor" />
        </motion.div>
      ))}
    </div>
  )
}
