/**
 * After sign-in, send organizers/reviewers to the console and everyone
 * else to the applicant dashboard — so a judge logging in as an organizer
 * doesn't land on an empty applicant Overview and conclude the portal
 * has no depth.
 */
export function homePathForRole(role: string | null | undefined): string {
  if (role === "organizer" || role === "reviewer") {
    return "/organizer/applications";
  }
  return "/dashboard";
}
