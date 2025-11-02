/**
 * Domain types for the Participant entity
 * These represent the core business concepts
 */

export type StudyGroup = 'treatment' | 'control'
export type ParticipantStatus = 'active' | 'completed' | 'withdrawn'
export type Gender = 'M' | 'F' | 'Other'

/**
 * Participant entity - represents a clinical trial participant
 */
export interface Participant {
  id: number
  participant_id: string
  subject_id: string
  study_group: StudyGroup
  enrollment_date: string
  status: ParticipantStatus
  age: number
  gender: Gender
  created_at: string
  updated_at: string
}

/**
 * DTO for creating a new participant
 */
export interface ParticipantCreate {
  subject_id: string
  study_group: StudyGroup
  enrollment_date: string
  status?: ParticipantStatus
  age: number
  gender: Gender
}

/**
 * Participant metrics - aggregate data about participants
 */
export interface ParticipantMetrics {
  total: number
  by_status: {
    active: number
    completed: number
    withdrawn: number
  }
  by_group: {
    treatment: number
    control: number
  }
}

