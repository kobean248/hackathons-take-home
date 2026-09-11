// Small flat progress ring — thin wrapper around the shared viz primitive.
import { RingProgress } from "@/components/viz/ring-progress";

export function ReviewRing({
  done,
  total,
  size = 26,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  return <RingProgress value={done} max={total} size={size} />;
}
