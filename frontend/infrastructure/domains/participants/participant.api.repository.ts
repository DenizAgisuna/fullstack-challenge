import axios from '@/infrastructure/api/axios-client'
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints'
import type { IParticipantRepository } from './participant.repository.interface'
import type { Participant, ParticipantCreate, ParticipantMetrics } from './participant.types'

/**
 * API adapter for Participant repository
 * Implements the repository interface using REST API calls via axios
 * Token is automatically injected by axios interceptors
 */
export class ParticipantApiRepository implements IParticipantRepository {
  async findAll(): Promise<Participant[]> {
    const response = await axios.get<Participant[]>(API_ENDPOINTS.participants.base)
    return response.data
  }

  async findById(id: number): Promise<Participant> {
    const response = await axios.get<Participant>(API_ENDPOINTS.participants.byId(id))
    return response.data
  }

  async create(data: ParticipantCreate): Promise<Participant> {
    const response = await axios.post<Participant>(API_ENDPOINTS.participants.base, data)
    return response.data
  }

  async update(id: number, data: ParticipantCreate): Promise<Participant> {
    const response = await axios.put<Participant>(API_ENDPOINTS.participants.byId(id), data)
    return response.data
  }

  async delete(id: number): Promise<void> {
    await axios.delete(API_ENDPOINTS.participants.byId(id))
  }

  async getMetrics(): Promise<ParticipantMetrics> {
    const response = await axios.get<ParticipantMetrics>(API_ENDPOINTS.participants.metrics)
    return response.data
  }
}

/**
 * Singleton instance of the participant repository
 * Can be easily swapped for testing (e.g., MockParticipantRepository)
 */
export const participantRepository: IParticipantRepository = new ParticipantApiRepository()

