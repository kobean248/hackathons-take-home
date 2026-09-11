// Shared TypeScript types for the app live here.
import type { ApplicationTypeKey } from "@/lib/applicationTypes";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "waitlisted"
  | "rejected";

export type AppRole = "applicant" | "reviewer" | "organizer";

export type ApplicationRow = {
  id: string;
  type: ApplicationTypeKey;
  status: ApplicationStatus;
  submitted_at: string | null;
  decided_at: string | null;
};

export type ApplicationStatusHistoryRow = {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  changed_at: string;
  note: string | null;
};
