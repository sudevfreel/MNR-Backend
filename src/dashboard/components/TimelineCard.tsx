interface TimelineItem {
  id: string
  time: string
  taskNumber: string
  title: string
  status: string
}

interface Props {
  timeline: TimelineItem[]
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  issue: 'bg-red-500',
  cancelled: 'bg-slate-400',
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TimelineCard({ timeline }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900">📅 Today's Timeline</h2>

        <p className="mt-2 text-sm text-slate-500">Latest activities for the selected day</p>
      </div>

      <div className="p-6">
        {timeline.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
            No activities recorded.
          </div>
        ) : (
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {index !== timeline.length - 1 && (
                  <div className="absolute left-3 top-8 h-full w-px bg-slate-200" />
                )}

                {/* Status Dot */}
                <div
                  className={`mt-1 h-6 w-6 rounded-full border-4 border-white ${
                    statusColor[item.status] ?? 'bg-slate-400'
                  }`}
                />

                {/* Content */}
                <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{item.taskNumber}</p>

                    <span className="text-sm text-slate-500">{formatTime(item.time)}</span>
                  </div>

                  <p className="mt-2 text-slate-600">{item.title}</p>

                  <div className="mt-3">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
