interface GroupProgress {
  id: string
  name: string
  site: string
  manager: string
  assigned: number
  completed: number
  percentage: number
}

interface Props {
  groups: GroupProgress[]
}

export default function GroupProgressCard({ groups }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">🏗 Site / Group Progress</h2>

            <p className="mt-1 text-sm text-slate-500">
              Overall progress of all construction groups
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 px-4 py-2">
            <span className="text-sm font-semibold text-slate-700">{groups.length} Sites</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            {/* Top */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{group.name}</h3>

                <p className="mt-1 text-sm text-slate-500">📍 {group.site}</p>
              </div>

              <div
                className={`rounded-xl px-3 py-2 text-sm font-bold ${
                  group.percentage >= 80
                    ? 'bg-green-100 text-green-700'
                    : group.percentage >= 50
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {group.percentage}%
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm text-slate-500">
                <span>Progress</span>

                <span>
                  {group.completed}/{group.assigned} Tasks
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    group.percentage >= 80
                      ? 'bg-green-500'
                      : group.percentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{
                    width: `${group.percentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-xs text-slate-500">Assigned</p>

                <p className="mt-1 text-xl font-bold text-slate-900">{group.assigned}</p>
              </div>

              <div className="rounded-xl bg-green-50 p-3 text-center">
                <p className="text-xs text-green-700">Completed</p>

                <p className="mt-1 text-xl font-bold text-green-700">{group.completed}</p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3 text-center">
                <p className="text-xs text-orange-700">Remaining</p>

                <p className="mt-1 text-xl font-bold text-orange-700">
                  {group.assigned - group.completed}
                </p>
              </div>
            </div>

            {/* Manager */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-xs text-slate-500">Site Manager</p>

                <p className="font-semibold text-slate-900">{group.manager}</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                👷
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
