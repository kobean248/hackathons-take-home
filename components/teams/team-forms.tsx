"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/shell/toast-provider";
import {
  createTeamAction,
  joinTeamAction,
  leaveTeamAction,
  upsertListingAction,
  removeListingAction,
  type TeamActionState,
} from "@/app/(app)/teams/actions";

const initial: TeamActionState = {};

// Fires a toast whenever an action's returned state settles into an
// ok/error result — a `useActionState` result object is a new reference
// each time an action completes, so this only fires on real transitions,
// not every render.
function useActionToast(state: TeamActionState, successMessage: string) {
  const { push } = useToast();
  const seen = useRef<TeamActionState | null>(null);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    if (state.error) push("error", state.error);
    else if (state.ok) push("success", successMessage);
  }, [state, successMessage, push]);
}

export function CreateTeamForm() {
  const [state, action, pending] = useActionState(createTeamAction, initial);
  useActionToast(state, "Team created.");

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-2xs font-medium text-ink-soft">
          Team name
        </label>
        <Input id="name" name="name" required maxLength={80} className="mt-1" />
      </div>
      <div>
        <label htmlFor="pitch" className="text-2xs font-medium text-ink-soft">
          Pitch
        </label>
        <Textarea
          id="pitch"
          name="pitch"
          maxLength={500}
          rows={3}
          placeholder="What are you building? Who do you need?"
          className="mt-1"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="looking"
          defaultChecked
          className="size-4 rounded-chip border-line accent-sunset"
        />
        Show on looking-for-teammates board
      </label>
      {state.error && (
        <p className="rounded-chip bg-brick/10 px-3 py-2 text-sm text-brick">
          {state.error}
        </p>
      )}
      {state.ok && state.joinCode && (
        <p className="rounded-chip bg-mint/10 px-3 py-2 text-sm text-mint">
          Team created. Share join code{" "}
          <span className="font-display font-semibold tabular-nums">
            {state.joinCode}
          </span>
        </p>
      )}
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Creating…" : "Create team"}
      </Button>
    </form>
  );
}

export function JoinTeamForm() {
  const [state, action, pending] = useActionState(joinTeamAction, initial);
  useActionToast(state, "Joined the team.");

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label
          htmlFor="join_code"
          className="text-2xs font-medium text-ink-soft"
        >
          Join code
        </label>
        <Input
          id="join_code"
          name="join_code"
          required
          maxLength={6}
          placeholder="ABC123"
          className="mt-1 uppercase"
        />
      </div>
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Joining…" : "Join"}
      </Button>
      {state.error && (
        <p className="basis-full text-sm text-brick">{state.error}</p>
      )}
    </form>
  );
}

export function LeaveTeamButton() {
  return (
    <form action={leaveTeamAction}>
      <Button type="submit" variant="outline" size="sm">
        Leave team
      </Button>
    </form>
  );
}

export function ListingForm({
  initialHeadline,
  initialSkills,
}: {
  initialHeadline?: string;
  initialSkills?: string;
}) {
  const [state, action, pending] = useActionState(upsertListingAction, initial);
  useActionToast(state, "Posted to the board.");

  return (
    <form action={action} className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="headline"
          className="text-2xs font-medium text-ink-soft"
        >
          Headline
        </label>
        <Input
          id="headline"
          name="headline"
          required
          maxLength={120}
          defaultValue={initialHeadline}
          placeholder="Frontend + ML, looking for a designer"
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="skills" className="text-2xs font-medium text-ink-soft">
          Skills
        </label>
        <Input
          id="skills"
          name="skills"
          maxLength={240}
          defaultValue={initialSkills}
          placeholder="React, Python, Figma"
          className="mt-1"
        />
      </div>
      {state.error && (
        <p className="text-sm text-brick">{state.error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Post to board"}
        </Button>
        <Button formAction={removeListingAction} type="submit" variant="outline">
          Remove listing
        </Button>
      </div>
    </form>
  );
}
