import { EntriesChart } from "@/components/EntriesChart"
import { ReportGenerator } from "@/components/report-generator"
import { ReportsList } from "@/components/reports-list"

export default function ReportsPage() {
  return (
    <>
      <EntriesChart />
      <ReportGenerator />
      <ReportsList />
    </>
  )
}
