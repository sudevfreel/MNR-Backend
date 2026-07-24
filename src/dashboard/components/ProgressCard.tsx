interface Progress {
  total: number
  completed: number
  percentage: number
}

interface Props {
  progress: Progress
}

export default function ProgressCard({ progress }: Props) {
  const remaining = progress.total - progress.completed

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Today's Progress</h2>

            <p className="mt-1 text-sm text-slate-500">Daily task completion overview</p>
          </div>

          <div className="rounded-2xl bg-green-100 px-4 py-2">
            <span className="text-lg font-bold text-green-700">{progress.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-5xl font-bold text-slate-900">{progress.percentage}%</p>

            <p className="mt-2 text-slate-500">
              {progress.completed} of {progress.total} tasks completed
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">Completion Rate</p>

            <p className="text-xl font-bold text-slate-900">{progress.percentage}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transition-all duration-700"
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">Assigned</p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">{progress.total}</h3>
          </div>

          <div className="rounded-2xl bg-green-50 p-5 text-center">
            <p className="text-sm text-green-700">Completed</p>

            <h3 className="mt-2 text-3xl font-bold text-green-700">{progress.completed}</h3>
          </div>

          <div className="rounded-2xl bg-orange-50 p-5 text-center">
            <p className="text-sm text-orange-700">Remaining</p>

            <h3 className="mt-2 text-3xl font-bold text-orange-700">{remaining}</h3>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Project Completion</span>

            <span className="font-semibold text-slate-900">
              {progress.completed}/{progress.total} Tasks
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
