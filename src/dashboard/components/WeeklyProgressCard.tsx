'use client'

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  data: {
    day: string
    assigned: number
    completed: number
  }[]
}

export default function WeeklyProgressCard({ data }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">📈 Weekly Progress</h2>

      <p className="mt-1 text-sm text-slate-500">Task completion over the last 7 days</p>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="assigned" name="Assigned" fill="#CBD5E1" radius={[8, 8, 0, 0]} />

            <Bar dataKey="completed" name="Completed" fill="#22C55E" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
