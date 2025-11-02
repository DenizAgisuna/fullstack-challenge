import { ParticipantsProvider } from '@/contexts/ParticipantsContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ParticipantsProvider>
      {children}
    </ParticipantsProvider>
  )
}

