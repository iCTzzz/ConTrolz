import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListEmployees,
  getListEmployeesQueryKey,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type EmployeeStatus = "active" | "inactive";

interface EmployeeFormData {
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  status: EmployeeStatus;
}

const emptyForm: EmployeeFormData = {
  employeeCode: "",
  name: "",
  department: "",
  position: "",
  status: "active",
};

export default function Employees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(emptyForm);

  const queryParams = {
    ...(search ? { search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as EmployeeStatus } : {}),
  };

  const { data: employees, isLoading } = useListEmployees(queryParams, {
    query: { queryKey: getListEmployeesQueryKey(queryParams) },
  });

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (emp: NonNullable<typeof employees>[0]) => {
    setForm({
      employeeCode: emp.employeeCode,
      name: emp.name,
      department: emp.department,
      position: emp.position,
      status: emp.status as EmployeeStatus,
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.employeeCode || !form.name || !form.department || !form.position) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    if (editingId) {
      updateEmployee.mutate(
        { id: editingId, data: { name: form.name, department: form.department, position: form.position, status: form.status } },
        {
          onSuccess: () => {
            toast.success("Empleado actualizado");
            setShowForm(false);
            invalidate();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Error al actualizar empleado");
          },
        }
      );
    } else {
      createEmployee.mutate(
        { data: form },
        {
          onSuccess: () => {
            toast.success("Empleado creado");
            setShowForm(false);
            invalidate();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Error al crear empleado");
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEmployee.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast.success("Empleado eliminado");
          setDeleteId(null);
          invalidate();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Error al eliminar empleado");
        },
      }
    );
  };

  const isSaving = createEmployee.isPending || updateEmployee.isPending;

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold">Empleados</h1>
          <Button onClick={openCreate} size="sm" className="gap-2 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" />
            Agregar Empleado
          </Button>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-accent/40 border-border/60"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-accent/40 border-border/60">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
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
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Código</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Departamento</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full bg-muted/50" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !employees?.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-muted-foreground">
                      Sin empleados registrados
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, i) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{emp.employeeCode}</td>
                      <td className="px-6 py-4 font-medium">{emp.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.position}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={emp.status === "active" ? "default" : "secondary"}
                          className={emp.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-muted/60 text-muted-foreground"
                          }
                        >
                          {emp.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" onClick={() => openEdit(emp)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(emp.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingId && (
              <div className="space-y-1.5">
                <Label>Código de Empleado</Label>
                <Input
                  placeholder="Ej: EMP007"
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value.toUpperCase() })}
                  className="font-mono bg-accent/40 border-border/60"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input
                placeholder="Nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-accent/40 border-border/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Departamento</Label>
              <Input
                placeholder="Ej: Ingeniería"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="bg-accent/40 border-border/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input
                placeholder="Ej: Desarrollador Senior"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="bg-accent/40 border-border/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EmployeeStatus })}>
                <SelectTrigger className="bg-accent/40 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={isSaving} className="border-border/60">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Guardar Cambios" : "Crear Empleado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Empleado</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente al empleado y todos sus registros de asistencia. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/60">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteEmployee.isPending}
            >
              {deleteEmployee.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
