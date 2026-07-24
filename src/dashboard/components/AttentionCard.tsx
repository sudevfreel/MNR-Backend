interface AttentionItem {
  id: string
  taskNumber: string
  title: string
  priority: string
  status: string
  assignedTo: string
}

interface Props {
  attention: AttentionItem[]
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export default function AttentionCard({ attention }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">🚨 Immediate Attention</h2>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {attention.length}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">Tasks that require immediate action.</p>
      </div>

      <div className="p-6">
        {attention.length === 0 ? (
          <div className="rounded-2xl bg-green-50 p-6 text-center">
            <p className="text-lg font-semibold text-green-700">🎉 No critical issues today</p>

            <p className="mt-2 text-sm text-green-600">Everything is running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attention.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-red-200 hover:bg-red-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{task.taskNumber}</p>

                    <p className="mt-1 text-slate-600">{task.title}</p>

                    <p className="mt-2 text-sm text-slate-500">👷 {task.assignedTo}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      priorityStyles[task.priority] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
