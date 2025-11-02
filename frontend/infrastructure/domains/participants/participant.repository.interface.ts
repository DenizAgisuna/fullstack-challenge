/**
 * Repository interface for Participant domain
 * Defines the contract for participant data operations
 * Following Repository Pattern from DDD
 */

import type { Participant, ParticipantCreate, ParticipantMetrics } from './participant.types'

/**
 * Interface defining all participant repository operations
 * Implementation can be swapped (API, LocalStorage, Mock, etc.)
 */
export interface IParticipantRepository {
  /**
   * Get all participants
   */
  findAll(): Promise<Participant[]>

  /**
   * Get a single participant by ID
   */
  findById(id: number): Promise<Participant>

  /**
   * Create a new participant
   */
  create(data: ParticipantCreate): Promise<Participant>

  /**
   * Update an existing participant
   */
  update(id: number, data: ParticipantCreate): Promise<Participant>

  /**
   * Delete a participant
   */
  delete(id: number): Promise<void>

  /**
   * Get participant metrics/summary
   */
  getMetrics(): Promise<ParticipantMetrics>
}

