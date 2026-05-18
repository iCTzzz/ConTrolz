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
import { Users, Clock, CheckCircle2, LogOut, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useClock } from "@/hooks/use-clock";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

export default function Dashboard() {
  const now = useClock();

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
        <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold">Panel de Control</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="tabular-nums">
              {format(now, "HH:mm:ss", { locale: es })}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="capitalize">{format(now, "EEEE d MMM", { locale: es })}</span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Total Empleados", value: stats?.totalEmployees, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
              { title: "Presentes Hoy", value: stats?.presentToday, icon: UserCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
              { title: "Entradas Hoy", value: stats?.checkInsToday, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { title: "Activos Ahora", value: stats?.activeNow, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
            ].map((card, i) => (
              <motion.div key={card.title} custom={i} initial="hidden" animate="show" variants={fadeUp}>
                <Card className="border-border/60 bg-card/80 hover:bg-card transition-colors duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                        {statsLoading ? (
                          <Skeleton className="h-8 w-14 mt-2 bg-muted/60" />
                        ) : (
                          <p className="text-3xl font-bold mt-1 tabular-nums">{card.value ?? 0}</p>
                        )}
                      </div>
                      <div className={`h-11 w-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <card.icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              className="col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Card className="border-border/60 bg-card/80 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full bg-muted/50" />
                      ))}
                    </div>
                  ) : !recentActivity?.length ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      Sin actividad reciente
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentActivity.map((log, i) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-accent/30 hover:bg-accent/60 transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${log.type === 'checkin' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                              {log.type === 'checkin' ? <CheckCircle2 className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{log.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{log.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium tabular-nums">
                              {format(new Date(log.timestamp), "HH:mm:ss")}
                            </p>
                            <p className={`text-xs font-medium ${log.type === 'checkin' ? 'text-emerald-400' : 'text-orange-400'}`}>
                              {log.type === 'checkin' ? 'Entrada' : 'Salida'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card className="border-border/60 bg-card/80 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Activos Ahora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full bg-muted/50" />
                      ))}
                    </div>
                  ) : !activeEmployees?.length ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      Sin empleados activos
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeEmployees.map((emp, i) => (
                        <motion.div
                          key={emp.employeeId}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.25 }}
                          className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.position}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {format(new Date(emp.checkedInAt), "HH:mm")}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
