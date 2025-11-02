"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useParticipants } from "@/contexts/ParticipantsContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ArrowLeft, Calendar, User, Hash, Edit, Save, X, Trash2 } from "lucide-react";
import type {
  Participant,
  ParticipantCreate,
  StudyGroup,
  Gender,
  ParticipantStatus,
} from "@/infrastructure/domains";

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { getParticipant, updateParticipant, deleteParticipant } = useParticipants();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track form state when editing
  const [formData, setFormData] = useState<ParticipantCreate | null>(null);
  const originalDataRef = useRef<ParticipantCreate | null>(null);

  const participantId = params.id ? Number(params.id) : null;

  /**
   * Normalize date string to YYYY-MM-DD format for backend
   * Handles various input formats and ensures consistent output
   */
  function normalizeDate(dateString: string): string {
    if (!dateString || typeof dateString !== "string") {
      return "";
    }

    // Trim whitespace
    const trimmed = dateString.trim();

    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // If it contains 'T', it's likely an ISO datetime string - extract just the date part
    if (trimmed.includes("T")) {
      const datePart = trimmed.split("T")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
    }

    // Try to parse the date - this handles various formats including 'Mon, 15 Jan 2024 00:00:00 GM'
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) {
      // If parsing fails completely, log and return empty string
      console.warn("Failed to parse date:", trimmed);
      return "";
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && participantId) {
      loadParticipant();
    }
  }, [authLoading, isAuthenticated, participantId]);

  // Check for unsaved changes when editing mode changes
  useEffect(() => {
    if (!isEditing && participant && formData) {
      // Reset form data when exiting edit mode without saving
      setFormData(null);
      originalDataRef.current = null;
    }
  }, [isEditing, participant]);

  // Detect navigation attempts when there are unsaved changes
  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges()) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing, formData]);

  function hasUnsavedChanges(): boolean {
    if (!formData || !originalDataRef.current) return false;

    return (
      formData.subject_id !== originalDataRef.current.subject_id ||
      formData.study_group !== originalDataRef.current.study_group ||
      formData.enrollment_date !== originalDataRef.current.enrollment_date ||
      formData.status !== originalDataRef.current.status ||
      formData.age !== originalDataRef.current.age ||
      formData.gender !== originalDataRef.current.gender
    );
  }

  async function loadParticipant() {
    if (!participantId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getParticipant(participantId);
      if (data) {
        setParticipant(data);
      } else {
        setError("Participant not found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load participant"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick() {
    if (!participant) return;

    // Initialize form data with current participant data
    // Normalize enrollment_date to YYYY-MM-DD format
    const normalizedDate = normalizeDate(participant.enrollment_date);

    const initialFormData: ParticipantCreate = {
      subject_id: participant.subject_id,
      study_group: participant.study_group,
      enrollment_date: normalizedDate,
      status: participant.status,
      age: participant.age,
      gender: participant.gender,
    };

    setFormData(initialFormData);
    originalDataRef.current = { ...initialFormData };
    setIsEditing(true);
    setSaveError(null);
  }

  function handleCancel() {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      setIsEditing(false);
      setFormData(null);
      originalDataRef.current = null;
      setSaveError(null);
    }
  }

  async function handleSave() {
    if (!participant || !formData) return;

    // Validation
    if (!formData.subject_id.trim()) {
      setSaveError("Subject ID is required");
      return;
    }

    if (formData.age <= 0 || formData.age > 150) {
      setSaveError("Age must be between 1 and 150");
      return;
    }

    if (!formData.enrollment_date) {
      setSaveError("Enrollment date is required");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      // Normalize enrollment_date to YYYY-MM-DD format before sending
      const dataToSend: ParticipantCreate = {
        ...formData,
        enrollment_date: normalizeDate(formData.enrollment_date),
      };

      const updated = await updateParticipant(participant.id, dataToSend);

      if (updated) {
        setParticipant(updated);
        setIsEditing(false);
        setFormData(null);
        originalDataRef.current = null;
      } else {
        setSaveError("Failed to update participant");
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update participant"
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleNavigation(navigateTo: () => void) {
    if (isEditing && hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      navigateTo();
    }
  }

  function handleDiscardChanges() {
    setIsEditing(false);
    setFormData(null);
    originalDataRef.current = null;
    setSaveError(null);
    setShowUnsavedDialog(false);

    if (pendingNavigation) {
      setPendingNavigation(null);
    }
  }

  function handleKeepEditing() {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  }

  function handleDeleteClick() {
    setShowDeleteDialog(true);
  }

  async function handleConfirmDelete() {
    if (!participant) return;

    try {
      setIsDeleting(true);
      const success = await deleteParticipant(participant.id);
      
      if (success) {
        router.push("/dashboard");
      } else {
        setSaveError("Failed to delete participant");
        setShowDeleteDialog(false);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete participant");
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    setShowDeleteDialog(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error || "Participant not found"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use formData when editing, participant otherwise
  const displayData = isEditing && formData ? formData : participant;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => handleNavigation(() => router.push("/dashboard"))}
          variant="outline"
          className="mb-6"
          disabled={isSaving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Participant Details</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Edit participant information"
                    : "View detailed information about this participant"}
                </CardDescription>
              </div>
              {!isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleEditClick} variant="default">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Participant
                  </Button>
                  <Button 
                    onClick={handleDeleteClick} 
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {saveError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {saveError}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center text-sm text-gray-600">
                  <Hash className="mr-2 h-4 w-4" />
                  Subject ID
                </Label>
                {isEditing ? (
                  <Input
                    value={formData?.subject_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData!, subject_id: e.target.value })
                    }
                    className="text-lg font-semibold"
                    required
                  />
                ) : (
                  <div className="text-lg font-semibold">
                    {participant.subject_id}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-sm text-gray-600">
                  <Hash className="mr-2 h-4 w-4" />
                  Participant ID
                </Label>
                <div className="text-lg font-semibold">
                  {participant.participant_id}
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Participant ID cannot be changed
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-sm text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  Age
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="150"
                    value={formData?.age || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        age: parseInt(e.target.value) || 0,
                      })
                    }
                    className="text-lg font-semibold"
                    required
                  />
                ) : (
                  <div className="text-lg font-semibold">{participant.age}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-sm text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  Gender
                </Label>
                {isEditing ? (
                  <Select
                    value={formData?.gender || "M"}
                    onValueChange={(value: Gender) =>
                      setFormData({ ...formData!, gender: value })
                    }
                  >
                    <SelectTrigger className="text-lg font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-lg font-semibold">
                    {participant.gender}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Enrollment Date
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData?.enrollment_date || ""}
                    onChange={(e) => {
                      // Date input always returns YYYY-MM-DD format, but normalize just to be safe
                      const normalizedValue = normalizeDate(e.target.value);
                      setFormData({
                        ...formData!,
                        enrollment_date: normalizedValue,
                      });
                    }}
                    className="text-lg font-semibold"
                    required
                  />
                ) : (
                  <div className="text-lg font-semibold">
                    {new Date(participant.enrollment_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Study Group</Label>
                {isEditing ? (
                  <Select
                    value={formData?.study_group || "treatment"}
                    onValueChange={(value: StudyGroup) =>
                      setFormData({ ...formData!, study_group: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="control">Control</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge value={participant.study_group} type="group" />
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Status</Label>
                {isEditing ? (
                  <Select
                    value={formData?.status || "active"}
                    onValueChange={(value: ParticipantStatus) =>
                      setFormData({ ...formData!, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge value={participant.status} type="status" />
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Record Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>{" "}
                  <span className="font-medium">
                    {new Date(participant.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>{" "}
                  <span className="font-medium">
                    {new Date(participant.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleKeepEditing}>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscardChanges}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete participant "{participant?.subject_id}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Participant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
