"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerInputProps {
  value: string
  onChange: (value: string) => void
  minHour?: number
  maxHour?: number
}

export function TimePickerInput({ value, onChange, minHour = 0, maxHour = 23 }: TimePickerInputProps) {
  const [hour, setHour] = useState("9")
  const [minute, setMinute] = useState("00")

  // 初期値を設定
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHour(h)
      setMinute(m)
    }
  }, [value])

  // 時間が変更されたときに親コンポーネントに通知
  const handleHourChange = (newHour: string) => {
    setHour(newHour)
    onChange(`${newHour}:${minute}`)
  }

  // 分が変更されたときに親コンポーネントに通知
  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
    onChange(`${hour}:${newMinute}`)
  }

  // 時間の選択肢を生成
  const hours = []
  for (let i = minHour; i <= maxHour; i++) {
    hours.push(i.toString())
  }

  // 分の選択肢
  const minutes = ["00", "15", "30", "45"]

  return (
    <div className="flex space-x-2">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="時" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}時
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="分" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}分
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
