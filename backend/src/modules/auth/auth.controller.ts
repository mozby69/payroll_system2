import { Request, Response } from "express";

export function me(req: Request, res: Response) {
  res.json((req as any).user);
}

export function logout(req: Request, res: Response) {
  res.clearCookie("token", { path: "/" });
  res.sendStatus(200);
}
