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
import { CheckCircle2, LogOut, X } from "lucide-react";

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
        <div className="h-16 flex items-center px-8 border-b bg-card">
          <h1 className="text-xl font-semibold">Attendance Logs</h1>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(0); }}
              className="w-48"
            />
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="checkin">Check-in</SelectItem>
                <SelectItem value="checkout">Check-out</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            <span className="ml-auto text-sm text-muted-foreground">
              {total} record{total !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !logs.length ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{log.employeeName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{log.employeeCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{log.department}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${log.type === "checkin" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                            {log.type === "checkin" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                          </div>
                          <Badge variant={log.type === "checkin" ? "default" : "secondary"} className={log.type === "checkin" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"}>
                            {log.type === "checkin" ? "Check-in" : "Check-out"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(log.timestamp), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {format(new Date(log.timestamp), "h:mm a")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
