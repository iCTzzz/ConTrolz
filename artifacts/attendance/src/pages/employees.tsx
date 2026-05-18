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
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      updateEmployee.mutate(
        { id: editingId, data: { name: form.name, department: form.department, position: form.position, status: form.status } },
        {
          onSuccess: () => {
            toast.success("Employee updated");
            setShowForm(false);
            invalidate();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update employee");
          },
        }
      );
    } else {
      createEmployee.mutate(
        { data: form },
        {
          onSuccess: () => {
            toast.success("Employee created");
            setShowForm(false);
            invalidate();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create employee");
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
          toast.success("Employee deleted");
          setDeleteId(null);
          invalidate();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to delete employee");
        },
      }
    );
  };

  const isSaving = createEmployee.isPending || updateEmployee.isPending;

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="h-16 flex items-center justify-between px-8 border-b bg-card">
          <h1 className="text-xl font-semibold">Employees</h1>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Position</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !employees?.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{emp.employeeCode}</td>
                      <td className="px-6 py-4 font-medium">{emp.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                      <td className="px-6 py-4 text-muted-foreground">{emp.position}</td>
                      <td className="px-6 py-4">
                        <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(emp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingId && (
              <div className="space-y-1.5">
                <Label>Employee Code</Label>
                <Input
                  placeholder="e.g. EMP007"
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value.toUpperCase() })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input
                placeholder="e.g. Senior Developer"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EmployeeStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Save Changes" : "Create Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the employee and all their attendance records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteEmployee.isPending}
            >
              {deleteEmployee.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
