import { EntriesChart } from "@/components/EntriesChart"
import { EntriesList } from "@/components/entries-list"
import { EntryForm } from "@/components/entry-form"
import { LogoutButton } from "@/components/logout-button"
import { QuickEntry } from "@/components/quick-entry"
import { ReportGenerator } from "@/components/report-generator"
import { ReportsList } from "@/components/reports-list"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center py-5 sm:py-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-3 sm:gap-6 sm:px-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            RageLog
          </h1>
          <LogoutButton className="h-11 min-h-11 shrink-0 px-4 text-base sm:h-8 sm:min-h-8 sm:px-2.5 sm:text-sm" />
        </div>
        <EntriesChart />
        <ReportGenerator />
        <ReportsList />
        <EntriesList />
        <QuickEntry />
        <EntryForm />
      </div>
    </div>
  )
}
