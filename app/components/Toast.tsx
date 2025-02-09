"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

interface ToastProps {
  message: string
  index: number
  onClose: () => void
}

export default function Toast({ message, index, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      style={{
        transform: `translateY(${-index * 10}px)`,
      }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#0f0f10] text-white px-4 py-2 rounded-md border border-gray-700 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      <AlertCircle className="w-5 h-5" />
      {message}
    </div>
  )
}

