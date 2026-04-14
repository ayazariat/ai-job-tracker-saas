import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Total Applications", value: "0", change: "+0 this week", icon: "📋" },
  { label: "Interviews", value: "0", change: "0 scheduled", icon: "🎯" },
  { label: "Response Rate", value: "0%", change: "— vs last month", icon: "📈" },
  { label: "Offers", value: "0", change: "0 pending", icon: "🎉" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Your career intelligence overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No applications yet. Start tracking your job search!
              </p>
              <a
                href="/applications"
                className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Add Application
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No upcoming reminders. Set one when you add applications.
              </p>
              <Badge variant="secondary" className="mt-3">
                Auto-reminders enabled
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
