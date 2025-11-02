import type { Participant } from '@/infrastructure/domains'
import { StatusBadge } from './StatusBadge'
import { useRouter } from 'next/navigation'

interface ParticipantsTableProps {
  participants: Participant[]
}

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  const router = useRouter()

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No participants found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Subject ID</th>
            <th className="text-left p-4">Group</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Age</th>
            <th className="text-left p-4">Gender</th>
            <th className="text-left p-4">Enrollment Date</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr
              key={participant.id}
              className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/participants/${participant.id}`)}
            >
              <td className="p-4">{participant.subject_id}</td>
              <td className="p-4">
                <StatusBadge value={participant.study_group} type="group" />
              </td>
              <td className="p-4">
                <StatusBadge value={participant.status} type="status" />
              </td>
              <td className="p-4">{participant.age}</td>
              <td className="p-4">{participant.gender}</td>
              <td className="p-4">{participant.enrollment_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}