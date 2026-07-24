import DateSelector from './DateSelector'

interface Props {
  selectedDate: string
}

export default function Header({ selectedDate }: Props) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">📊 MNR Operations Dashboard</h1>

        <p className="mt-2 text-slate-500">Construction Monitoring & Workforce Analytics</p>
      </div>

      <div className="flex items-center gap-4">
        <DateSelector selectedDate={selectedDate} />

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs text-slate-500">Logged in as</p>

          <p className="font-semibold">Admin</p>
        </div>
      </div>
    </div>
  )
}
