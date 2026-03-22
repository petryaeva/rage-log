import { EntriesList } from "@/components/entries-list"
import { EntryForm } from "@/components/entry-form"
import { LogoutButton } from "@/components/logout-button"
import { QuickEntry } from "@/components/quick-entry"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center py-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-lg font-semibold">RageLog</h1>
          <LogoutButton />
        </div>
        <EntriesList />
        <QuickEntry />
        <EntryForm />
      </div>
    </div>
  )
}
