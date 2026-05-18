import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { employeesTable } from "./employees";

export const attendanceTypeEnum = pgEnum("attendance_type", ["checkin", "checkout"]);

export const attendanceLogsTable = pgTable("attendance_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employeesTable.id, { onDelete: "cascade" }),
  type: attendanceTypeEnum("type").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export type AttendanceLog = typeof attendanceLogsTable.$inferSelect;
