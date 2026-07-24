import Dashboard from '@/dashboard/components/Dashboard'

export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams

  return <Dashboard date={params.date} />
}
