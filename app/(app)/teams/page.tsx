import { createClient } from "@/lib/supabase/server";
import {
  CreateTeamForm,
  JoinTeamForm,
  LeaveTeamButton,
  ListingForm,
} from "@/components/teams/team-forms";
import { BearSleeping, BearWaving } from "@/components/illustrations";
import { QuestionIcon } from "@/components/icons";
import { CatalogSeal } from "@/components/brand/catalog-seal";
import { Avatar } from "@/components/avatar";

type TeamRow = {
  id: string;
  name: string;
  pitch: string;
  join_code: string;
  looking_for_teammates: boolean;
  created_by: string;
};

type MemberRow = {
  team_id: string;
  user_id: string;
  role: string;
  profiles: { full_name: string | null; email: string } | null;
};

type ListingRow = {
  id: string;
  user_id: string;
  headline: string;
  skills: string;
  profiles: { full_name: string | null; email: string } | null;
};

function asProfile(
  value: unknown
): { full_name: string | null; email: string } | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0] as
      | { full_name: string | null; email: string }
      | undefined;
    return first ?? null;
  }
  return value as { full_name: string | null; email: string };
}

export default async function TeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user!.id)
    .maybeSingle();

  let myTeam: TeamRow | null = null;
  let members: MemberRow[] = [];

  if (membership?.team_id) {
    const [{ data: team }, { data: memberRows }] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name, pitch, join_code, looking_for_teammates, created_by")
        .eq("id", membership.team_id)
        .maybeSingle(),
      supabase
        .from("team_members")
        .select(
          "team_id, user_id, role, profiles:profiles!team_members_user_id_fkey(full_name, email)"
        )
        .eq("team_id", membership.team_id),
    ]);
    myTeam = team as TeamRow | null;
    members = ((memberRows as unknown as MemberRow[] | null) ?? []).map(
      (m) => ({
        ...m,
        profiles: asProfile(m.profiles),
      })
    );
  }

  const [{ data: openTeams }, { data: listings }, { data: myListing }] =
    await Promise.all([
      supabase
        .from("teams")
        .select("id, name, pitch, join_code, looking_for_teammates, created_by")
        .eq("looking_for_teammates", true)
        .order("created_at", { ascending: false })
        .limit(24),
      supabase
        .from("teammate_listings")
        .select(
          "id, user_id, headline, skills, profiles:profiles!teammate_listings_user_id_fkey(full_name, email)"
        )
        .order("created_at", { ascending: false })
        .limit(24),
      supabase
        .from("teammate_listings")
        .select("headline, skills")
        .eq("user_id", user!.id)
        .maybeSingle(),
    ]);

  const listingRows: ListingRow[] = (
    (listings as unknown as
      | {
          id: string;
          user_id: string;
          headline: string;
          skills: string;
          profiles: unknown;
        }[]
      | null) ?? []
  ).map((l) => ({
    ...l,
    profiles: asProfile(l.profiles),
  }));

  const lookingTeams = ((openTeams as TeamRow[] | null) ?? []).filter(
    (t) => t.id !== myTeam?.id
  );

  return (
    <main className="flex flex-col gap-8">
      <section className="glass relative overflow-hidden rounded-xl p-6 sm:p-8">
        <BearWaving className="pointer-events-none absolute -right-2 top-2 w-24 opacity-90 sm:right-4 sm:w-28" />
        <CatalogSeal
          topText="TEAM"
          bottomText="ROSTER"
          className="pointer-events-none absolute bottom-2 right-3 w-14 opacity-70 sm:bottom-3 sm:right-6"
        />
        <div className="relative z-10 max-w-lg">
          <p className="text-2xs font-medium text-ink-soft">Teams</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink">
            Find your crew
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Create a team, share a join code, or browse people still looking.
          </p>
        </div>
      </section>

      {myTeam ? (
        <section className="rounded-xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-h3 font-semibold text-ink">
                {myTeam.name}
              </h2>
              {myTeam.pitch && (
                <p className="mt-2 max-w-lg text-sm text-ink-soft">
                  {myTeam.pitch}
                </p>
              )}
              <p className="mt-3 text-2xs text-ink-soft">
                Join code{" "}
                <span className="font-display text-sm font-semibold tabular-nums text-sunset">
                  {myTeam.join_code}
                </span>
              </p>
            </div>
            <LeaveTeamButton />
          </div>
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {members.map((m) => {
              const memberName =
                m.profiles?.full_name || m.profiles?.email || "Member";
              return (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="flex items-center gap-2.5 text-ink">
                    <Avatar id={m.user_id} name={memberName} size="size-7" />
                    {memberName}
                  </span>
                  <span className="text-2xs text-ink-soft">{m.role}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-h3 font-semibold text-ink">
              Create a team
            </h2>
            <div className="mt-4">
              <CreateTeamForm />
            </div>
          </section>
          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-h3 font-semibold text-ink">
              Join with a code
            </h2>
            <div className="mt-4">
              <JoinTeamForm />
            </div>
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="font-display text-sm font-semibold text-ink">
                Looking for a team?
              </h3>
              <p className="mt-1 text-2xs text-ink-soft">
                Post yourself on the board so teams can find you.
              </p>
              <div className="mt-4">
                <ListingForm
                  initialHeadline={myListing?.headline}
                  initialSkills={myListing?.skills}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      <section>
        <h2 className="font-display text-h3 font-semibold text-ink">
          Looking for teammates
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Teams that still have open seats.
        </p>
        {lookingTeams.length === 0 ? (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
              <BearSleeping className="w-24 shrink-0 sm:w-28" />
              <div className="flex max-w-md flex-col gap-2">
                <div className="flex items-center gap-2 text-sky">
                  <QuestionIcon className="size-5" />
                  <span className="text-2xs font-medium">No open teams</span>
                </div>
                <h3 className="font-display text-sm font-semibold text-ink">
                  Nobody&apos;s posted an open team yet.
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  Create one above and check &quot;Show on looking-for-teammates
                  board&quot; to be the first.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {lookingTeams.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <h3 className="font-display text-sm font-semibold text-ink">
                  {t.name}
                </h3>
                {t.pitch && (
                  <p className="mt-2 text-2xs text-ink-soft">{t.pitch}</p>
                )}
                <p className="mt-3 text-2xs text-ink-soft">
                  Code{" "}
                  <span className="font-display font-semibold tabular-nums text-sunset">
                    {t.join_code}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-h3 font-semibold text-ink">
          People looking
        </h2>
        {listingRows.length ? (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
            {listingRows.map((l) => {
              const listerName = l.profiles?.full_name || l.profiles?.email || "Hacker";
              return (
                <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar id={l.user_id} name={listerName} size="size-8" />
                  <div>
                    <p className="text-sm font-medium text-ink">{l.headline}</p>
                    <p className="mt-0.5 text-2xs text-ink-soft">
                      {listerName}
                      {l.skills ? ` · ${l.skills}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            No solo listings yet.
          </p>
        )}
      </section>
    </main>
  );
}
