import { redirect } from "next/navigation";

// Matches the route map in dev_plan.md §6: /organizer -> /organizer/applications
export default function OrganizerIndexPage() {
  redirect("/organizer/applications");
}
