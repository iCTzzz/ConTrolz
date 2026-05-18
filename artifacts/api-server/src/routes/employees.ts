import { Router } from "express";
import { db, employeesTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import {
  ListEmployeesQueryParams,
  CreateEmployeeBody,
  GetEmployeeParams,
  UpdateEmployeeParams,
  UpdateEmployeeBody,
  DeleteEmployeeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/employees", async (req, res) => {
  const parsed = ListEmployeesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid query params" });
  }
  const { search, department, status } = parsed.data;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(employeesTable.name, `%${search}%`),
        ilike(employeesTable.employeeCode, `%${search}%`),
        ilike(employeesTable.department, `%${search}%`),
      )
    );
  }
  if (department) {
    conditions.push(eq(employeesTable.department, department));
  }
  if (status) {
    conditions.push(eq(employeesTable.status, status as "active" | "inactive"));
  }

  const rows = await db
    .select()
    .from(employeesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(employeesTable.name);

  return res.json(rows);
});

router.post("/employees", async (req, res) => {
  const parsed = CreateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: parsed.error.message });
  }

  const existing = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.employeeCode, parsed.data.employeeCode))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "Conflict", message: "Employee code already exists" });
  }

  const [created] = await db
    .insert(employeesTable)
    .values({
      employeeCode: parsed.data.employeeCode,
      name: parsed.data.name,
      department: parsed.data.department,
      position: parsed.data.position,
      status: (parsed.data.status ?? "active") as "active" | "inactive",
    })
    .returning();

  return res.status(201).json(created);
});

router.get("/employees/:id", async (req, res) => {
  const parsed = GetEmployeeParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid id" });
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, parsed.data.id))
    .limit(1);

  if (!employee) {
    return res.status(404).json({ error: "Not Found", message: "Employee not found" });
  }

  return res.json(employee);
});

router.put("/employees/:id", async (req, res) => {
  const paramsParsed = UpdateEmployeeParams.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid id" });
  }

  const bodyParsed = UpdateEmployeeBody.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: "Bad Request", message: bodyParsed.error.message });
  }

  const [existing] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, paramsParsed.data.id))
    .limit(1);

  if (!existing) {
    return res.status(404).json({ error: "Not Found", message: "Employee not found" });
  }

  const updates: Partial<typeof employeesTable.$inferInsert> = {};
  const body = bodyParsed.data;
  if (body.name !== undefined) updates.name = body.name;
  if (body.department !== undefined) updates.department = body.department;
  if (body.position !== undefined) updates.position = body.position;
  if (body.status !== undefined) updates.status = body.status as "active" | "inactive";
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(employeesTable)
    .set(updates)
    .where(eq(employeesTable.id, paramsParsed.data.id))
    .returning();

  return res.json(updated);
});

router.delete("/employees/:id", async (req, res) => {
  const parsed = DeleteEmployeeParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid id" });
  }

  const [existing] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, parsed.data.id))
    .limit(1);

  if (!existing) {
    return res.status(404).json({ error: "Not Found", message: "Employee not found" });
  }

  await db.delete(employeesTable).where(eq(employeesTable.id, parsed.data.id));

  return res.status(204).send();
});

export default router;
