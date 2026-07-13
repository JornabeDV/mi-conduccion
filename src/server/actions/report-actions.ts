"use server";

import { reportService, type ReportType } from "@/server/services/report-service";
import { requireUserId } from "@/server/actions";
import { handleActionError, type ActionResult } from "@/server/actions/utils";

export async function generateReport(type: ReportType): Promise<ActionResult<{ filename: string; content: string }>> {
  try {
    const userId = await requireUserId();
    const result = await reportService.generateCsv(userId, type);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}
