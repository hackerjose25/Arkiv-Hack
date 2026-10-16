import example from "@/examples/public-dashboard.json";
import { encodeDashboard } from "@/lib/dashboard";
export function GET() {
  return new Response(encodeDashboard(example), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="arkivsight-public-dashboard.json"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
