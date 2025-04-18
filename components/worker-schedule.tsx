import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface WorkerAssignment {
  id: string
  name: string
  assignedHours: number[]
  totalHours: number
  requiredHours: number | null
}

interface WorkerScheduleProps {
  workerAssignments: WorkerAssignment[]
}

export function WorkerSchedule({ workerAssignments }: WorkerScheduleProps) {
  // 時間を文字列形式に変換する関数
  const formatHour = (hour: number) => `${hour}:00`

  // 連続した時間を範囲としてまとめる
  const formatTimeRanges = (hours: number[]) => {
    if (hours.length === 0) return "なし"

    const sortedHours = [...hours].sort((a, b) => a - b)
    const ranges = []

    let rangeStart = sortedHours[0]
    let rangeEnd = sortedHours[0]

    for (let i = 1; i < sortedHours.length; i++) {
      if (sortedHours[i] === rangeEnd + 1) {
        // 連続している場合は範囲を拡張
        rangeEnd = sortedHours[i]
      } else {
        // 連続していない場合は新しい範囲を開始
        ranges.push([rangeStart, rangeEnd])
        rangeStart = sortedHours[i]
        rangeEnd = sortedHours[i]
      }
    }

    // 最後の範囲を追加
    ranges.push([rangeStart, rangeEnd])

    // 範囲を文字列に変換
    return ranges
      .map(([start, end]) => {
        if (start === end) {
          return formatHour(start)
        } else {
          return `${formatHour(start)}〜${formatHour(end + 1)}`
        }
      })
      .join(", ")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">個人別シフト</h3>

      {workerAssignments.map((worker) => {
        const requirementMet = worker.requiredHours === null || worker.totalHours >= worker.requiredHours

        return (
          <Card key={worker.id} className={`border-l-4 ${requirementMet ? "border-l-green-500" : "border-l-red-500"}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{worker.name}</CardTitle>
                <Badge variant={requirementMet ? "default" : "destructive"}>
                  {worker.totalHours}時間
                  {worker.requiredHours !== null && `/${worker.requiredHours}時間`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                {requirementMet ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>{formatTimeRanges(worker.assignedHours)}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
