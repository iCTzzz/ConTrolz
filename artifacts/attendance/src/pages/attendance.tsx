import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListAttendanceLogs,
  getListAttendanceLogsQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, LogOut, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Attendance() {
  const [date, setDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  const queryParams = {
    ...(date ? { date } : {}),
    ...(typeFilter !== "all" ? { type: typeFilter as "checkin" | "checkout" } : {}),
    limit,
    offset: page * limit,
  };

  const { data, isLoading } = useListAttendanceLogs(queryParams, {
    query: { queryKey: getListAttendanceLogsQueryKey(queryParams) },
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setDate("");
    setTypeFilter("all");
    setPage(0);
  };

  const hasFilters = date || typeFilter !== "all";

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="h-16 flex items-center px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold">Registros de Asistencia</h1>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(0); }}
              className="w-48 bg-accent/40 border-border/60"
            />
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-44 bg-accent/40 border-border/60">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="checkin">Entrada</SelectItem>
                <SelectItem value="checkout">Salida</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            )}
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {total} {total === 1 ? "registro" : "registros"}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-border/60 rounded-xl overflow-hidden bg-card/80"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Departamento</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Hora</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full bg-muted/50" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !logs.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-14 text-muted-foreground">
                      Sin registros de asistencia
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.2 }}
                      className="border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{log.employeeName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{log.employeeCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{log.department}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center ${log.type === "checkin" ? "bg-emerald-500/15 text-emerald-400" : "bg-orange-500/15 text-orange-400"}`}>
                            {log.type === "checkin" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                          </div>
                          <Badge
                            variant="secondary"
                            className={log.type === "checkin"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            }
                          >
                            {log.type === "checkin" ? "Entrada" : "Salida"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground capitalize">
                        {format(new Date(log.timestamp), "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4 font-medium font-mono tabular-nums">
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground tabular-nums">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="border-border/60"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="border-border/60"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
