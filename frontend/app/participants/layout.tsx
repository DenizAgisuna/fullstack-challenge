import { ParticipantsProvider } from '@/contexts/ParticipantsContext'

export default function ParticipantsLayout({
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