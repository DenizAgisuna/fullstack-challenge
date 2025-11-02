"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useParticipants } from "@/contexts/ParticipantsContext"
import type { ParticipantCreate, StudyGroup, Gender } from "@/infrastructure/domains"

export function AddParticipantDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createParticipant } = useParticipants()

  const [formData, setFormData] = useState<ParticipantCreate>({
    subject_id: "",
    study_group: "treatment",
    enrollment_date: new Date().toISOString().split("T")[0],
    status: "active",
    age: 0,
    gender: "M",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.subject_id.trim()) {
        setError("Subject ID is required")
        setIsSubmitting(false)
        return
      }

      if (formData.age <= 0 || formData.age > 150) {
        setError("Age must be between 1 and 150")
        setIsSubmitting(false)
        return
      }

      if (!formData.enrollment_date) {
        setError("Enrollment date is required")
        setIsSubmitting(false)
        return
      }

      const result = await createParticipant(formData)
      
      if (result) {
        // Reset form and close dialog
        setFormData({
          subject_id: "",
          study_group: "treatment",
          enrollment_date: new Date().toISOString().split("T")[0],
          status: "active",
          age: 0,
          gender: "M",
        })
        setOpen(false)
        setError(null)
      } else {
        setError("Failed to create participant. Please check all fields and try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Participant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Participant</DialogTitle>
          <DialogDescription>
            Enter the participant information to enroll them in the clinical trial.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject_id">Subject ID *</Label>
              <Input
                id="subject_id"
                value={formData.subject_id}
                onChange={(e) =>
                  setFormData({ ...formData, subject_id: e.target.value })
                }
                placeholder="Enter subject ID"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="study_group">Study Group *</Label>
              <Select
                value={formData.study_group}
                onValueChange={(value: StudyGroup) =>
                  setFormData({ ...formData, study_group: value })
                }
              >
                <SelectTrigger id="study_group">
                  <SelectValue placeholder="Select study group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="control">Control</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="enrollment_date">Enrollment Date *</Label>
              <Input
                id="enrollment_date"
                type="date"
                value={formData.enrollment_date}
                onChange={(e) =>
                  setFormData({ ...formData, enrollment_date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "active"}
                onValueChange={(value: "active" | "completed" | "withdrawn") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="150"
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter age"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: Gender) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-500 mt-2">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setError(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Participant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

