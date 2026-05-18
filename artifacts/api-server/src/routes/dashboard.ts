import { Router } from "express";
import { db, employeesTable, attendanceLogsTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employeesTable)
    .where(eq(employeesTable.status, "active"));

  const todayLogs = await db
    .select({
      employeeId: attendanceLogsTable.employeeId,
      type: attendanceLogsTable.type,
      timestamp: attendanceLogsTable.timestamp,
    })
    .from(attendanceLogsTable)
    .where(
      and(
        gte(attendanceLogsTable.timestamp, today),
        lte(attendanceLogsTable.timestamp, tomorrow),
      )
    )
    .orderBy(attendanceLogsTable.employeeId, attendanceLogsTable.timestamp);

  let checkInsToday = 0;
  let checkOutsToday = 0;
  const latestByEmployee = new Map<string, "checkin" | "checkout">();

  for (const log of todayLogs) {
    if (log.type === "checkin") checkInsToday++;
    if (log.type === "checkout") checkOutsToday++;
    latestByEmployee.set(log.employeeId, log.type);
  }

  let activeNow = 0;
  let presentToday = 0;
  const seenEmployees = new Set<string>();

  for (const log of todayLogs) {
    if (!seenEmployees.has(log.employeeId)) {
      seenEmployees.add(log.employeeId);
      presentToday++;
    }
  }

  for (const [, lastType] of latestByEmployee) {
    if (lastType === "checkin") activeNow++;
  }

  return res.json({
    totalEmployees: totalResult?.count ?? 0,
    activeNow,
    checkInsToday,
    checkOutsToday,
    presentToday,
  });
});

export default router;
