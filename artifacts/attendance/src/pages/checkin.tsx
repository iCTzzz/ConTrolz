import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCheckIn, useCheckOut, getGetDashboardStatsQueryKey, getGetActiveEmployeesQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useClock } from "@/hooks/use-clock";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Checkin() {
  const [code, setCode] = useState("");
  const [lastAction, setLastAction] = useState<{ name: string; type: "checkin" | "checkout" } | null>(null);
  const queryClient = useQueryClient();

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const now = useClock();

  const handleAction = (type: "checkin" | "checkout") => {
    if (!code.trim()) {
      toast.error("Ingresa tu código de empleado");
      return;
    }

    const action = type === "checkin" ? checkIn : checkOut;

    action.mutate(
      { data: { employeeCode: code.trim().toUpperCase() } },
      {
        onSuccess: (log) => {
          const msg = type === "checkin" ? "Entrada registrada" : "Salida registrada";
          toast.success(msg, {
            description: `${log.employeeName} · ${format(new Date(log.timestamp), "HH:mm:ss")}`,
          });
          setLastAction({ name: log.employeeName, type });
          setCode("");
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetActiveEmployeesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        },
        onError: (err: any) => {
          const message = err.response?.data?.message || "Ocurrió un error";
          toast.error(message);
        },
      }
    );
  };

  const isPending = checkIn.isPending || checkOut.isPending;

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 gap-6">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center"
        >
          <div className="font-mono text-6xl font-bold tabular-nums tracking-tight text-foreground">
            {format(now, "HH:mm:ss")}
          </div>
          <p className="text-muted-foreground text-sm mt-1 capitalize">
            {format(now, "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Card className="border-border/60 bg-card/90 shadow-2xl shadow-black/30">
            <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center">
              <div className="h-14 w-14 bg-primary/15 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                <Clock className="h-7 w-7 text-primary" />
              </div>

              <h2 className="text-xl font-semibold mb-1">Terminal de Acceso</h2>
              <p className="text-muted-foreground text-center text-sm mb-7">
                Ingresa tu código para registrar entrada o salida
              </p>

              <div className="w-full space-y-4">
                <Input
                  type="text"
                  placeholder="Código de empleado"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-xl h-13 tracking-widest uppercase font-mono bg-accent/50 border-border/60 focus:border-primary/60"
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAction("checkin");
                  }}
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    className="w-full h-12 text-base gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    onClick={() => handleAction("checkin")}
                    disabled={isPending}
                  >
                    {checkIn.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Entrada
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 text-base gap-2 border-border/60 hover:bg-accent"
                    onClick={() => handleAction("checkout")}
                    disabled={isPending}
                  >
                    {checkOut.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        Salida
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {lastAction && (
            <motion.div
              key={lastAction.name + lastAction.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border ${
                lastAction.type === "checkin"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-orange-500/10 border-orange-500/20 text-orange-400"
              }`}
            >
              {lastAction.type === "checkin" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>
                {lastAction.name} — {lastAction.type === "checkin" ? "Entrada registrada" : "Salida registrada"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
