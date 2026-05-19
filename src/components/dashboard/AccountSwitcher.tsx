'use client'

interface Account {
  id: string
  username?: string
  name: string | null
}

interface AccountSwitcherProps {
  accounts: Account[]
  selected: string
  onChange: (id: string) => void
  allLabel?: string
}

export function AccountSwitcher({
  accounts,
  selected,
  onChange,
  allLabel = 'All Accounts',
}: AccountSwitcherProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="all">{allLabel}</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name ?? a.username ?? a.id}
        </option>
      ))}
    </select>
  )
}
