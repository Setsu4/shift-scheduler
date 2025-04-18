"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { TimePickerInput } from "@/components/time-picker-input"
import { WorkerSchedule } from "@/components/worker-schedule"
import { ShiftResult } from "@/components/shift-result"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 時間を6時から22時までの範囲で表示するための配列
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)

// 時間を文字列形式に変換する関数
const formatHour = (hour: number) => `${hour}:00`

// 時間文字列を数値に変換する関数
const parseTimeToHour = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours + minutes / 60
}

// 労働者の型定義
interface Worker {
  id: string
  name: string
  startTime: string
  endTime: string
  requiredHours: number | null
}

// 時間帯ごとの必要人数の型定義を変更
interface StaffRequirement {
  id: string
  startHour: number
  endHour: number
  required: number
}

// 各時間帯の必要人数の型定義
interface HourlyRequirement {
  hour: number
  required: number
}

export default function ShiftScheduler() {
  // 労働者のリスト
  const [workers, setWorkers] = useState<Worker[]>([])
  // 各時間帯の必要人数
  const [hourlyRequirements, setHourlyRequirements] = useState<HourlyRequirement[]>(
    HOURS.map((hour) => ({ hour, required: 1 })),
  )
  // hourlyRequirements の定義と関連する関数を変更
  const [staffRequirements, setStaffRequirements] = useState<StaffRequirement[]>([
    {
      id: `req-${Date.now()}`,
      startHour: 6,
      endHour: 22,
      required: 1,
    },
  ])
  // 計算されたシフト結果
  const [shiftResult, setShiftResult] = useState<any>(null)
  // 新しい労働者の入力フォーム
  const [newWorker, setNewWorker] = useState<Worker>({
    id: "worker-",
    name: "",
    startTime: "9:00",
    endTime: "17:00",
    requiredHours: null,
  })

  // コンポーネントがマウントされたときに一意のIDを設定
  useEffect(() => {
    setNewWorker((prev) => ({
      ...prev,
      id: `worker-${Date.now()}`,
    }))
  }, [])

  // 労働者を追加する関数
  const addWorker = () => {
    if (!newWorker.name) return
    setWorkers([...workers, { ...newWorker }])
    setNewWorker({
      id: `worker-${Date.now()}`,
      name: "",
      startTime: "9:00",
      endTime: "17:00",
      requiredHours: null,
    })
  }

  // 労働者を削除する関数
  const removeWorker = (id: string) => {
    setWorkers(workers.filter((worker) => worker.id !== id))
  }

  // 時間帯ごとの必要人数を更新する関数
  const updateHourlyRequirement = (hour: number, required: number) => {
    setHourlyRequirements(hourlyRequirements.map((req) => (req.hour === hour ? { ...req, required } : req)))
  }

  // 時間帯の要件を追加する関数
  const addStaffRequirement = () => {
    setStaffRequirements([
      ...staffRequirements,
      {
        id: `req-${Date.now()}`,
        startHour: 6,
        endHour: 22,
        required: 1,
      },
    ])
  }

  // 時間帯の要件を削除する関数
  const removeStaffRequirement = (id: string) => {
    setStaffRequirements(staffRequirements.filter((req) => req.id !== id))
  }

  // 時間帯の要件を更新する関数
  const updateStaffRequirement = (id: string, data: Partial<StaffRequirement>) => {
    setStaffRequirements(staffRequirements.map((req) => (req.id === id ? { ...req, ...data } : req)))
  }

  // シフトを計算する関数を修正
  const calculateShift = () => {
    // 各時間帯の労働者の割り当て
    const hourlyAssignments: Record<number, string[]> = {}

    // 各労働者の割り当て時間
    const workerAssignments: Record<string, number[]> = {}

    // 初期化
    HOURS.forEach((hour) => {
      hourlyAssignments[hour] = []
    })

    workers.forEach((worker) => {
      workerAssignments[worker.id] = []
    })

    // 各労働者の希望時間を解析
    const workerAvailability = workers.map((worker) => {
      const startHour = parseTimeToHour(worker.startTime)
      const endHour = parseTimeToHour(worker.endTime)

      return {
        ...worker,
        startHour,
        endHour,
        availableHours: HOURS.filter((hour) => hour >= Math.floor(startHour) && hour < Math.ceil(endHour)),
      }
    })

    // 各時間帯に対して、必要な人数を割り当てる
    HOURS.forEach((hour) => {
      // 該当する時間帯の要件を見つける
      const applicableRequirements = staffRequirements.filter((req) => hour >= req.startHour && hour < req.endHour)

      // 最も高い要件を適用（複数の時間帯が重なる場合）
      const requirement =
        applicableRequirements.length > 0 ? Math.max(...applicableRequirements.map((req) => req.required)) : 0

      // その時間に働ける労働者をフィルタリング
      const availableWorkers = workerAvailability.filter((worker) => worker.availableHours.includes(hour))

      // 優先順位付け（必須時間がある労働者を優先）
      const sortedWorkers = [...availableWorkers].sort((a, b) => {
        // 既に割り当てられた時間数
        const aAssigned = workerAssignments[a.id]?.length || 0
        const bAssigned = workerAssignments[b.id]?.length || 0

        // 必須時間がある場合
        if (a.requiredHours !== null && b.requiredHours !== null) {
          // 必須時間に対する達成率が低い方を優先
          const aRatio = aAssigned / a.requiredHours
          const bRatio = bAssigned / b.requiredHours
          return aRatio - bRatio
        } else if (a.requiredHours !== null) {
          // aだけ必須時間がある場合はaを優先
          return -1
        } else if (b.requiredHours !== null) {
          // bだけ必須時間がある場合はbを優先
          return 1
        }

        // どちらも必須時間がない場合は、割り当て時間が少ない方を優先
        return aAssigned - bAssigned
      })

      // 必要な人数だけ割り当てる
      for (let i = 0; i < Math.min(requirement, sortedWorkers.length); i++) {
        const worker = sortedWorkers[i]
        hourlyAssignments[hour].push(worker.id)
        workerAssignments[worker.id].push(hour)
      }
    })

    // 結果を整形
    const result = {
      hourlyAssignments: Object.entries(hourlyAssignments).map(([hour, workerIds]) => ({
        hour: Number.parseInt(hour),
        workers: workerIds.map((id) => {
          const worker = workers.find((w) => w.id === id)
          return worker ? worker.name : "Unknown"
        }),
      })),
      workerAssignments: workers.map((worker) => ({
        id: worker.id,
        name: worker.name,
        assignedHours: workerAssignments[worker.id] || [],
        totalHours: workerAssignments[worker.id]?.length || 0,
        requiredHours: worker.requiredHours,
      })),
    }

    setShiftResult(result)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">シフト作成補助アプリ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 労働者情報入力セクション */}
        <Card>
          <CardHeader>
            <CardTitle>出勤希望者情報</CardTitle>
            <CardDescription>出勤希望者の名前と希望時間を入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 新しい労働者の追加フォーム */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">名前</Label>
                  <Input
                    id="name"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    placeholder="名前を入力"
                  />
                </div>
                <div>
                  <Label htmlFor="requiredHours">必須勤務時間 (時間)</Label>
                  <Input
                    id="requiredHours"
                    type="number"
                    min="0"
                    max="16"
                    value={newWorker.requiredHours === null ? "" : newWorker.requiredHours}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : Number(e.target.value)
                      setNewWorker({ ...newWorker, requiredHours: value })
                    }}
                    placeholder="必要な場合のみ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">開始時間</Label>
                  <TimePickerInput
                    value={newWorker.startTime}
                    onChange={(value) => setNewWorker({ ...newWorker, startTime: value })}
                    minHour={6}
                    maxHour={21}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">終了時間</Label>
                  <TimePickerInput
                    value={newWorker.endTime}
                    onChange={(value) => setNewWorker({ ...newWorker, endTime: value })}
                    minHour={7}
                    maxHour={22}
                  />
                </div>
              </div>

              <Button onClick={addWorker} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> 希望者を追加
              </Button>
            </div>

            {/* 追加された労働者のリスト */}
            <div className="space-y-4">
              <h3 className="font-medium">登録済み希望者 ({workers.length}人)</h3>
              {workers.length === 0 ? (
                <p className="text-muted-foreground text-sm">希望者が登録されていません</p>
              ) : (
                <div className="space-y-2">
                  {workers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {worker.startTime} 〜 {worker.endTime}
                          {worker.requiredHours !== null && ` (必須: ${worker.requiredHours}時間)`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeWorker(worker.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 時間帯ごとの必要人数設定 */}
        <Card>
          <CardHeader>
            <CardTitle>時間帯ごとの必要人数</CardTitle>
            <CardDescription>時間帯と必要な人数を設定してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {staffRequirements.map((req) => (
              <div key={req.id} className="space-y-4 p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    時間帯 {req.startHour}:00 〜 {req.endHour}:00
                  </h4>
                  {staffRequirements.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeStaffRequirement(req.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>時間範囲</Label>
                    <span className="text-sm text-muted-foreground">
                      {req.startHour}:00 〜 {req.endHour}:00
                    </span>
                  </div>
                  <div className="pt-4">
                    <Slider
                      value={[req.startHour, req.endHour]}
                      min={6}
                      max={22}
                      step={1}
                      minStepsBetweenThumbs={1}
                      onValueChange={([start, end]) =>
                        updateStaffRequirement(req.id, { startHour: start, endHour: end })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`required-${req.id}`}>必要人数</Label>
                  <Select
                    value={req.required.toString()}
                    onValueChange={(value) => updateStaffRequirement(req.id, { required: Number.parseInt(value) })}
                  >
                    <SelectTrigger id={`required-${req.id}`}>
                      <SelectValue placeholder="人数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1人</SelectItem>
                      <SelectItem value="2">2人</SelectItem>
                      <SelectItem value="3">3人</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <Button onClick={addStaffRequirement} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> 時間帯を追加
            </Button>
          </CardContent>
          <CardFooter>
            <Button onClick={calculateShift} className="w-full" disabled={workers.length === 0}>
              シフトを計算する
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 計算結果の表示 */}
      {shiftResult && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>シフト計算結果</CardTitle>
              <CardDescription>最適化されたシフト割り当て</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <WorkerSchedule workerAssignments={shiftResult.workerAssignments} />
                <ShiftResult hourlyAssignments={shiftResult.hourlyAssignments} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
