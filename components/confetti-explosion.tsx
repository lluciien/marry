"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type ConfettiPiece = {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
}

interface ConfettiExplosionProps {
  count?: number
  duration?: number
  force?: number
  colors?: string[]
}

export function ConfettiExplosion({
  count = 100,
  duration = 3000,
  force = 0.5,
  colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"],
}: ConfettiExplosionProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isExploding, setIsExploding] = useState(true)

  useEffect(() => {
    if (isExploding) {
      const newPieces: ConfettiPiece[] = []
      for (let i = 0; i < count; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100 - 50, // -50 to 50
          y: Math.random() * -100 * force, // More negative = higher
          size: Math.random() * 10 + 5, // 5 to 15
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
        })
      }
      setPieces(newPieces)

      // Stop explosion after duration
      const timer = setTimeout(() => {
        setIsExploding(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isExploding, count, duration, force, colors])

  if (!isExploding) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: piece.x + "vw",
            y: piece.y + "vh",
            rotate: piece.rotation,
            opacity: 0,
          }}
          transition={{
            duration: duration / 1000,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
        />
      ))}
    </div>
  )
}
