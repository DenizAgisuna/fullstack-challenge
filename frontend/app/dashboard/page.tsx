'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'
import { useParticipants } from '@/contexts/ParticipantsContext'
import { MetricsGrid } from '@/components/dashboard/MetricsGrid'
import { ParticipantsTable } from '@/components/dashboard/ParticipantsTable'
import { AddParticipantDialog } from '@/components/dashboard/AddParticipantDialog'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, clearAuth } = useAuth()
  const { participants, metrics, isLoading, error } = useParticipants()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (error && error.includes('Invalid')) {
      clearAuth()
    }
  }, [error, clearAuth])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Clinical Trial Dashboard</h1>
          <Button onClick={clearAuth} variant="outline">
            Logout
          </Button>
        </div>

        {metrics && <MetricsGrid metrics={metrics} />}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Participants</CardTitle>
                <CardDescription>List of all enrolled participants</CardDescription>
              </div>
              <AddParticipantDialog />
            </div>
          </CardHeader>
          <CardContent>
            <ParticipantsTable participants={participants} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

