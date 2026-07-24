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
  const selectedDate = date ? new Date(date) : new Date()
  const dashboard = await getDailyDashboard(selectedDate)
  const weeklyProgress = await getWeeklyProgress()
  const groups = await getGroupProgress()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl space-y-8 p-8">
        <Header selectedDate={selectedDate.toISOString().split('T')[0]} />

        {/* <SummaryGrid summary={dashboard.summary} /> */}

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
