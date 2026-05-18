import { Router } from "express";
import { db, employeesTable, attendanceLogsTable } from "@workspace/db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import {
  CheckInBody,
  CheckOutBody,
  ListAttendanceLogsQueryParams,
  GetRecentActivityQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.post("/attendance/checkin", async (req, res) => {
  const parsed = CheckInBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: parsed.error.message });
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.employeeCode, parsed.data.employeeCode))
    .limit(1);

  if (!employee) {
    return res.status(404).json({ error: "Not Found", message: "Employee not found" });
  }

  if (employee.status === "inactive") {
    return res.status(400).json({ error: "Bad Request", message: "Employee is inactive" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const recentLogs = await db
    .select()
    .from(attendanceLogsTable)
    .where(
      and(
        eq(attendanceLogsTable.employeeId, employee.id),
        gte(attendanceLogsTable.timestamp, today),
        lte(attendanceLogsTable.timestamp, tomorrow),
      )
    )
    .orderBy(desc(attendanceLogsTable.timestamp))
    .limit(1);

  const lastLog = recentLogs[0];
  if (lastLog && lastLog.type === "checkin") {
    return res.status(400).json({ error: "Bad Request", message: "Employee already has an active check-in" });
  }

  const [log] = await db
    .insert(attendanceLogsTable)
    .values({ employeeId: employee.id, type: "checkin" })
    .returning();

  return res.status(201).json({
    id: log.id,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.name,
    department: employee.department,
    type: log.type,
    timestamp: log.timestamp,
  });
});

router.post("/attendance/checkout", async (req, res) => {
  const parsed = CheckOutBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: parsed.error.message });
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.employeeCode, parsed.data.employeeCode))
    .limit(1);

  if (!employee) {
    return res.status(404).json({ error: "Not Found", message: "Employee not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const recentLogs = await db
    .select()
    .from(attendanceLogsTable)
    .where(
      and(
        eq(attendanceLogsTable.employeeId, employee.id),
        gte(attendanceLogsTable.timestamp, today),
        lte(attendanceLogsTable.timestamp, tomorrow),
      )
    )
    .orderBy(desc(attendanceLogsTable.timestamp))
    .limit(1);

  const lastLog = recentLogs[0];
  if (!lastLog || lastLog.type === "checkout") {
    return res.status(400).json({ error: "Bad Request", message: "No active check-in found for today" });
  }

  const [log] = await db
    .insert(attendanceLogsTable)
    .values({ employeeId: employee.id, type: "checkout" })
    .returning();

  return res.json({
    id: log.id,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.name,
    department: employee.department,
    type: log.type,
    timestamp: log.timestamp,
  });
});

router.get("/attendance/logs", async (req, res) => {
  const parsed = ListAttendanceLogsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid query params" });
  }

  const { employeeId, date, type, limit = 50, offset = 0 } = parsed.data;

  const conditions = [];
  if (employeeId) {
    conditions.push(eq(attendanceLogsTable.employeeId, employeeId));
  }
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    conditions.push(gte(attendanceLogsTable.timestamp, start));
    conditions.push(lte(attendanceLogsTable.timestamp, end));
  }
  if (type) {
    conditions.push(eq(attendanceLogsTable.type, type as "checkin" | "checkout"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendanceLogsTable)
    .where(whereClause);

  const rows = await db
    .select({
      id: attendanceLogsTable.id,
      employeeId: attendanceLogsTable.employeeId,
      type: attendanceLogsTable.type,
      timestamp: attendanceLogsTable.timestamp,
      employeeCode: employeesTable.employeeCode,
      employeeName: employeesTable.name,
      department: employeesTable.department,
    })
    .from(attendanceLogsTable)
    .innerJoin(employeesTable, eq(attendanceLogsTable.employeeId, employeesTable.id))
    .where(whereClause)
    .orderBy(desc(attendanceLogsTable.timestamp))
    .limit(limit)
    .offset(offset);

  return res.json({
    logs: rows,
    total: countResult?.count ?? 0,
    offset,
    limit,
  });
});

router.get("/attendance/active", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const allTodayLogs = await db
    .select({
      id: attendanceLogsTable.id,
      employeeId: attendanceLogsTable.employeeId,
      type: attendanceLogsTable.type,
      timestamp: attendanceLogsTable.timestamp,
      employeeCode: employeesTable.employeeCode,
      name: employeesTable.name,
      department: employeesTable.department,
      position: employeesTable.position,
    })
    .from(attendanceLogsTable)
    .innerJoin(employeesTable, eq(attendanceLogsTable.employeeId, employeesTable.id))
    .where(
      and(
        gte(attendanceLogsTable.timestamp, today),
        lte(attendanceLogsTable.timestamp, tomorrow),
      )
    )
    .orderBy(attendanceLogsTable.employeeId, desc(attendanceLogsTable.timestamp));

  const latestByEmployee = new Map<string, typeof allTodayLogs[0]>();
  for (const log of allTodayLogs) {
    if (!latestByEmployee.has(log.employeeId)) {
      latestByEmployee.set(log.employeeId, log);
    }
  }

  const activeEmployees = [];
  for (const [, log] of latestByEmployee) {
    if (log.type === "checkin") {
      activeEmployees.push({
        employeeId: log.employeeId,
        employeeCode: log.employeeCode,
        name: log.name,
        department: log.department,
        position: log.position,
        checkedInAt: log.timestamp,
      });
    }
  }

  return res.json(activeEmployees);
});

router.get("/attendance/recent", async (req, res) => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid query params" });
  }

  const limit = parsed.data.limit ?? 10;

  const rows = await db
    .select({
      id: attendanceLogsTable.id,
      employeeId: attendanceLogsTable.employeeId,
      type: attendanceLogsTable.type,
      timestamp: attendanceLogsTable.timestamp,
      employeeCode: employeesTable.employeeCode,
      employeeName: employeesTable.name,
      department: employeesTable.department,
    })
    .from(attendanceLogsTable)
    .innerJoin(employeesTable, eq(attendanceLogsTable.employeeId, employeesTable.id))
    .orderBy(desc(attendanceLogsTable.timestamp))
    .limit(limit);

  return res.json(rows);
});

export default router;
