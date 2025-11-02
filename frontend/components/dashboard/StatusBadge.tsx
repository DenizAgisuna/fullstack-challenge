interface StatusBadgeProps {
  value: string
  type: 'status' | 'group'
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-red-100 text-red-800',
}

const groupStyles: Record<string, string> = {
  treatment: 'bg-purple-100 text-purple-800',
  control: 'bg-orange-100 text-orange-800',
}

export function StatusBadge({ value, type }: StatusBadgeProps) {
  const styles = type === 'status' ? statusStyles : groupStyles
  const className = `px-2 py-1 rounded text-sm ${styles[value] || 'bg-gray-100 text-gray-800'}`

  return <span className={className}>{value}</span>
}

