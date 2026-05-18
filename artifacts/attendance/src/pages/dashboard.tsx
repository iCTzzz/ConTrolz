import { Layout } from "@/components/layout";
import {
  useGetDashboardStats,
  getGetDashboardStatsQueryKey,
  useGetActiveEmployees,
  useGetRecentActivity,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Clock, CheckCircle2, LogOut, ArrowRight, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { refetchInterval: 30000, queryKey: getGetDashboardStatsQueryKey() },
  });

  const { data: activeEmployees, isLoading: activeLoading } = useGetActiveEmployees({
    query: { refetchInterval: 30000 },
  });

  const { data: recentActivity, isLoading: activityLoading } = useGetRecentActivity(
    { limit: 10 },
    { query: { refetchInterval: 30000, queryKey: getGetRecentActivityQueryKey({ limit: 10 }) } }
  );

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="h-16 flex items-center px-8 border-b bg-card">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value={stats?.totalEmployees}
              icon={Users}
              isLoading={statsLoading}
            />
            <StatCard
              title="Present Today"
              value={stats?.presentToday}
              icon={UserCheck}
              isLoading={statsLoading}
            />
            <StatCard
              title="Check-ins Today"
              value={stats?.checkInsToday}
              icon={CheckCircle2}
              isLoading={statsLoading}
              iconClassName="text-green-500"
            />
            <StatCard
              title="Currently Active"
              value={stats?.activeNow}
              icon={Clock}
              isLoading={statsLoading}
              iconClassName="text-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : !recentActivity?.length ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${log.type === 'checkin' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {log.type === 'checkin' ? <CheckCircle2 className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{log.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(log.timestamp), "h:mm a")}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {log.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Active Now</CardTitle>
              </CardHeader>
              <CardContent>
                {activeLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : !activeEmployees?.length ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active employees
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeEmployees.map((emp) => (
                      <div key={emp.employeeId} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.position}</p>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(emp.checkedInAt), "h:mm a")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading, 
  iconClassName 
}: { 
  title: string; 
  value?: number; 
  icon: React.ElementType; 
  isLoading: boolean;
  iconClassName?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-semibold mt-1">{value ?? 0}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Icon className={`h-6 w-6 text-muted-foreground ${iconClassName || ""}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
