import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HourlyAssignment {
  hour: number
  workers: string[]
}

interface ShiftResultProps {
  hourlyAssignments: HourlyAssignment[]
}

export function ShiftResult({ hourlyAssignments }: ShiftResultProps) {
  // 時間帯ごとにソート
  const sortedAssignments = [...hourlyAssignments].sort((a, b) => a.hour - b.hour)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">時間帯別シフト</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">時間</TableHead>
            <TableHead>勤務者</TableHead>
            <TableHead className="text-right w-16">人数</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAssignments.map((assignment) => (
            <TableRow key={assignment.hour}>
              <TableCell className="font-medium">{assignment.hour}:00</TableCell>
              <TableCell>
                {assignment.workers.length > 0 ? (
                  assignment.workers.join(", ")
                ) : (
                  <span className="text-muted-foreground italic">なし</span>
                )}
              </TableCell>
              <TableCell className="text-right">{assignment.workers.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
