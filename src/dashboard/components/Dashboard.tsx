// import { getDailyDashboard } from '../services/dashboard.service'
// import { getGroupProgress } from '../services/group-progress.service'
// import { getWeeklyProgress } from '../services/weekly-progress.service'
// import AIDailySummary from './AIDailySummary'
// import AttentionCard from './AttentionCard'
// import GroupProgressCard from './GroupProgressCard'
// import Header from './Header'
// import ProgressCard from './ProgressCard'
// import TimelineCard from './TimelineCard'
// import WeeklyProgressCard from './WeeklyProgressCard'
// import WorkforceCard from './WorkforceCard'

// interface Props {
//   date?: string
// }

// export default async function Dashboard({ date }: Props) {
//   const selectedDate = date ? new Date(date) : new Date()
//   const dashboard = await getDailyDashboard(selectedDate)
//   const weeklyProgress = await getWeeklyProgress()
//   const groups = await getGroupProgress()

//   return (
//     <div className="min-h-screen bg-slate-100">
//       <div className="mx-auto max-w-7xl space-y-8 p-8">
//         <Header selectedDate={selectedDate.toISOString().split('T')[0]} />

//         {/* <SummaryGrid summary={dashboard.summary} /> */}

//         <div className="grid gap-8 xl:grid-cols-3">
//           <div className="xl:col-span-2">
//             <ProgressCard progress={dashboard.progress} />
//           </div>

//           <WorkforceCard workforce={dashboard.workforce} />
//         </div>

//         <div className="grid gap-8 xl:grid-cols-2">
//           <AttentionCard attention={dashboard.attention} />

//           <TimelineCard timeline={dashboard.timeline} />

//           <WeeklyProgressCard data={weeklyProgress} />
//         </div>

//         <GroupProgressCard groups={groups} />

//         <AIDailySummary summary={dashboard.aiSummary} />
//       </div>
//     </div>
//   )
// }

import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { getDailyDashboard } from '../services/dashboard.service'
import { getGroupProgress } from '../services/group-progress.service'
import { getWeeklyProgress } from '../services/weekly-progress.service'

import AIDailySummary from './AIDailySummary'
import AttentionCard from './AttentionCard'
import GroupProgressCard from './GroupProgressCard'
import Header from './Header'
import ProgressCard from './ProgressCard'
import TimelineCard from './TimelineCard'
import WeeklyProgressCard from './WeeklyProgressCard'
import WorkforceCard from './WorkforceCard'

interface Props {
  date?: string
}

export default async function Dashboard({ date }: Props) {
  // ============================================
  // 1. Authenticate User
  // ============================================

  const payload = await getPayload({ config })

  const { user } = await payload.auth({
    headers: await import('next/headers').then((mod) => mod.headers()),
  })

  // Not logged in
  if (!user) {
    redirect('/admin/login')
  }

  // ============================================
  // 2. Admin Authorization
  // ============================================

  if (user.role !== 'admin') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <span className="text-3xl">🔒</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>

          <p className="mt-3 leading-7 text-slate-500">
            You are not authorized to access the MNR Operations Dashboard. This section is available
            only to administrators.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="font-semibold text-slate-800">{user.name || user.email}</p>
            <p className="mt-1 text-xs capitalize text-red-600">Role: {user.role}</p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // 3. Fetch Dashboard Data
  // ============================================

  const selectedDate = date ? new Date(date) : new Date()

  const dashboard = await getDailyDashboard(selectedDate)
  const weeklyProgress = await getWeeklyProgress()
  const groups = await getGroupProgress()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <Header
          selectedDate={selectedDate.toISOString().split('T')[0]}
          userName={user.name || user.email || 'Admin'}
          userRole={user.role}
        />

        <div className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ProgressCard progress={dashboard.progress} />
          </div>

          <WorkforceCard workforce={dashboard.workforce} />
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <AttentionCard attention={dashboard.attention} />

          <TimelineCard timeline={dashboard.timeline} />

          <WeeklyProgressCard data={weeklyProgress} />
        </div>

        <GroupProgressCard groups={groups} />

        <AIDailySummary summary={dashboard.aiSummary} />
      </div>
    </div>
  )
}
