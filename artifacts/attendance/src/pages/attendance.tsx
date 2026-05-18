import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListAttendanceLogs,
  getListAttendanceLogsQueryKey,
  useUpdateAttendanceLog,
  useDeleteAttendanceLog,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, LogOut, X, Lock, LockOpen, Pencil, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_PASSWORD = "123";

type LogEntry = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  type: "checkin" | "checkout";
  timestamp: string;
};

export default function Attendance() {
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [editForm, setEditForm] = useState({ type: "checkin", timestamp: "" });
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);

  const queryParams = {
    ...(date ? { date } : {}),
    ...(typeFilter !== "all" ? { type: typeFilter as "checkin" | "checkout" } : {}),
    limit,
    offset: page * limit,
  };

  const { data, isLoading } = useListAttendanceLogs(queryParams, {
    query: { queryKey: getListAttendanceLogsQueryKey(queryParams) },
  });

  const updateLog = useUpdateAttendanceLog();
  const deleteLog = useDeleteAttendanceLog();

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const invalidateLogs = () =>
    queryClient.invalidateQueries({ queryKey: getListAttendanceLogsQueryKey() });

  const clearFilters = () => {
    setDate("");
    setTypeFilter("all");
    setPage(0);
  };

  const handleUnlock = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    setPasswordInput("");
    setPasswordError(false);
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordDialog(false);
      toast.success("Modo administrador activado");
    } else {
      setPasswordError(true);
    }
  };

  const openEdit = (log: LogEntry) => {
    setEditingLog(log);
    setEditForm({
      type: log.type,
      timestamp: format(new Date(log.timestamp), "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const handleEditSubmit = () => {
    if (!editingLog) return;
    updateLog.mutate(
      {
        id: editingLog.id,
        data: {
          type: editForm.type as "checkin" | "checkout",
          timestamp: new Date(editForm.timestamp).toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Registro actualizado");
          setEditingLog(null);
          invalidateLogs();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Error al actualizar");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteLogId) return;
    deleteLog.mutate(
      { id: deleteLogId },
      {
        onSuccess: () => {
          toast.success("Registro eliminado");
          setDeleteLogId(null);
          invalidateLogs();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Error al eliminar");
        },
      }
    );
  };

  const hasFilters = date || typeFilter !== "all";

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold">Registros de Asistencia</h1>
          <button
            onClick={handleUnlock}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isAdmin
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                : "bg-muted/60 text-muted-foreground border border-border/60 hover:bg-accent hover:text-foreground"
            }`}
          >
            {isAdmin ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {isAdmin ? "Admin activo" : "Administrador"}
          </button>
        </div>

        <AnimatePresence>
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mx-8 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>Modo administrador activo — puedes editar y eliminar registros de asistencia.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  {isAdmin && (
                    <th className="text-right px-6 py-3 font-medium text-amber-500/70 text-xs uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {Array.from({ length: isAdmin ? 6 : 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full bg-muted/50" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !logs.length ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-14 text-muted-foreground">
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
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-amber-500/10 hover:text-amber-400 text-muted-foreground"
                              onClick={() => openEdit(log as LogEntry)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteLogId(log.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
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
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="border-border/60">
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="border-border/60">
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => { setShowPasswordDialog(open); setPasswordError(false); }}>
        <DialogContent className="max-w-sm bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Acceso de Administrador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Contraseña</Label>
            <Input
              type="password"
              placeholder="Ingresa la contraseña"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              className={`bg-accent/40 border-border/60 ${passwordError ? "border-destructive/70 focus:border-destructive" : ""}`}
              autoFocus
            />
            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive"
              >
                Contraseña incorrecta
              </motion.p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="border-border/60">
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit} className="bg-primary hover:bg-primary/90">
              Entrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Log Dialog */}
      <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
        <DialogContent className="max-w-sm bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          {editingLog && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium">{editingLog.employeeName}</p>
                <p className="text-xs text-muted-foreground font-mono">{editingLog.employeeCode}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                  <SelectTrigger className="bg-accent/40 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkin">Entrada</SelectItem>
                    <SelectItem value="checkout">Salida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha y hora</Label>
                <Input
                  type="datetime-local"
                  value={editForm.timestamp}
                  onChange={(e) => setEditForm({ ...editForm, timestamp: e.target.value })}
                  className="bg-accent/40 border-border/60"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)} className="border-border/60">
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateLog.isPending} className="bg-primary hover:bg-primary/90">
              {updateLog.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLogId} onOpenChange={(open) => !open && setDeleteLogId(null)}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Registro</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro de asistencia. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/60">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteLog.isPending}
            >
              {deleteLog.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
