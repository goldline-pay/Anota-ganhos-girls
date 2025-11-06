/**
 * Custom authentication middleware for email/password auth
 * Bypasses Manus OAuth SDK
 */

import { Request, Response } from "express";
import * as db from "../db";

export async function getAuthenticatedUser(req: Request, res: Response) {
  // Para este projeto, não usamos OAuth do Manus
  // A autenticação é feita via JWT no header Authorization
  // O middleware authedProcedure em routers.ts cuida disso
  return null;
}
