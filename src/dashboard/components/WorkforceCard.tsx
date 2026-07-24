interface Workforce {
  working: number
  completed: number
  issues: number
  noResponse: number
}

interface Props {
  workforce: Workforce
}

function StatusRow({
  color,
  emoji,
  label,
  value,
}: {
  color: string
  emoji: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <span className="text-lg">{emoji}</span>
        </div>

        <div>
          <p className="font-medium text-slate-800">{label}</p>

          <p className="text-sm text-slate-500">Employees</p>
        </div>
      </div>

      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
  )
}

export default function WorkforceCard({ workforce }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900">Workforce Status</h2>

        <p className="mt-1 text-sm text-slate-500">Live employee status for the selected day</p>
      </div>

      <div className="space-y-4 p-6">
        <StatusRow emoji="👷" label="Working" value={workforce.working} color="bg-blue-100" />

        <StatusRow emoji="✅" label="Completed" value={workforce.completed} color="bg-green-100" />

        <StatusRow emoji="⚠️" label="Issues" value={workforce.issues} color="bg-red-100" />

        <StatusRow
          emoji="⏳"
          label="No Response"
          value={workforce.noResponse}
          color="bg-orange-100"
        />
      </div>
    </div>
  )
}
