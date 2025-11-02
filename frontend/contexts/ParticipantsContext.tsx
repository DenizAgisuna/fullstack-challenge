"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { participantRepository } from "@/infrastructure/domains";
import type {
  Participant,
  ParticipantMetrics,
  ParticipantCreate,
} from "@/infrastructure/domains";
import { useAuth } from "./AuthContext";

interface ParticipantsContextType {
  participants: Participant[];
  metrics: ParticipantMetrics | null;
  isLoading: boolean;
  error: string | null;
  loadParticipants: () => Promise<void>;
  refreshData: () => Promise<void>;
  getParticipant: (id: number) => Promise<Participant | null>;
  createParticipant: (data: ParticipantCreate) => Promise<Participant | null>;
  updateParticipant: (
    id: number,
    data: ParticipantCreate
  ) => Promise<Participant | null>;
  deleteParticipant: (id: number) => Promise<boolean>;
  clearError: () => void;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(
  undefined
);

export function ParticipantsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [metrics, setMetrics] = useState<ParticipantMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [participantsData, metricsData] = await Promise.all([
        participantRepository.findAll(),
        participantRepository.getMetrics(),
      ]);
      setParticipants(participantsData);
      setMetrics(metricsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load participants";
      setError(errorMessage);
      setParticipants([]);
      setMetrics(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshData = useCallback(async () => {
    await loadParticipants();
  }, [loadParticipants]);

  const getParticipant = useCallback(
    async (id: number): Promise<Participant | null> => {
      if (!isAuthenticated) return null;

      try {
        const participant = await participantRepository.findById(id);
        setParticipants((prev) => {
          const index = prev.findIndex((p) => p.id === id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = participant;
            return updated;
          }
          return [...prev, participant];
        });
        return participant;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch participant"
        );
        return null;
      }
    },
    [isAuthenticated]
  );

  const createParticipant = useCallback(
    async (data: ParticipantCreate): Promise<Participant | null> => {
      if (!isAuthenticated) return null;

      try {
        setError(null);
        const newParticipant = await participantRepository.create(data);
        setParticipants((prev) => [...prev, newParticipant]);
        const updatedMetrics = await participantRepository.getMetrics();
        setMetrics(updatedMetrics);
        return newParticipant;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create participant"
        );
        return null;
      }
    },
    [isAuthenticated]
  );

  const updateParticipant = useCallback(
    async (
      id: number,
      data: ParticipantCreate
    ): Promise<Participant | null> => {
      if (!isAuthenticated) return null;

      try {
        setError(null);
        const updatedParticipant = await participantRepository.update(id, data);
        setParticipants((prev) =>
          prev.map((p) => (p.id === id ? updatedParticipant : p))
        );
        const updatedMetrics = await participantRepository.getMetrics();
        setMetrics(updatedMetrics);
        return updatedParticipant;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update participant"
        );
        return null;
      }
    },
    [isAuthenticated]
  );

  const deleteParticipant = useCallback(
    async (id: number): Promise<boolean> => {
      if (!isAuthenticated) return false;

      try {
        setError(null);
        await participantRepository.delete(id);
        setParticipants((prev) => prev.filter((p) => p.id !== id));
        const updatedMetrics = await participantRepository.getMetrics();
        setMetrics(updatedMetrics);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete participant"
        );
        return false;
      }
    },
    [isAuthenticated]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadParticipants();
    } else {
      setParticipants([]);
      setMetrics(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadParticipants]);

  return (
    <ParticipantsContext.Provider
      value={{
        participants,
        metrics,
        isLoading,
        error,
        loadParticipants,
        refreshData,
        getParticipant,
        createParticipant,
        updateParticipant,
        deleteParticipant,
        clearError,
      }}
    >
      {children}
    </ParticipantsContext.Provider>
  );
}

export function useParticipants() {
  const context = useContext(ParticipantsContext);
  if (context === undefined) {
    throw new Error(
      "useParticipants must be used within a ParticipantsProvider"
    );
  }
  return context;
}
