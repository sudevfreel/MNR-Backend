'use client'

import { useRouter } from 'next/navigation'

interface Props {
  selectedDate: string
}

export default function DateSelector({ selectedDate }: Props) {
  const router = useRouter()

  return (
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => {
        router.push(`/dashboard?date=${e.target.value}`)
      }}
      className="rounded-lg border border-slate-300 px-3 py-2"
    />
  )
}
