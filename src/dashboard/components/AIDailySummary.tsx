interface Props {
  summary: string
}

export default function AIDailySummary({ summary }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900">🤖 AI Daily Summary</h2>

        <p className="mt-2 text-sm text-slate-500">AI-generated operational insights</p>
      </div>

      <div className="p-6">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 p-6">
          <p className="whitespace-pre-wrap leading-8 text-slate-700">{summary}</p>
        </div>
      </div>
    </div>
  )
}
