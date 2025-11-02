import type { ParticipantMetrics } from '@/infrastructure/domains'
import { Users, Activity, CheckCircle, XCircle } from 'lucide-react'
import { MetricCard } from './MetricCard'

interface MetricsGridProps {
  metrics: ParticipantMetrics
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricCards = [
    {
      title: 'Total Participants',
      value: metrics.total,
      icon: Users,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Active',
      value: metrics.by_status.active,
      icon: Activity,
      iconColor: 'text-green-500',
    },
    {
      title: 'Treatment',
      value: metrics.by_group.treatment,
      icon: CheckCircle,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Control',
      value: metrics.by_group.control,
      icon: XCircle,
      iconColor: 'text-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {metricCards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  )
}

