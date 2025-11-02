import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  iconColor: string
}

export function MetricCard({ title, value, icon: Icon, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Icon className={`h-8 w-8 ${iconColor} mr-2`} />
          <div className="text-3xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

