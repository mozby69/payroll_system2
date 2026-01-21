// import { Request, Response } from "express";
// import { loginUser } from "./login.services";
// import { LoginDTO } from "./login.types";

// export async function loginController(
//   req: Request<{}, {}, LoginDTO>,
//   res: Response
// ) {
//   try {
//     const result = await loginUser(req.body);
//     res.status(200).json(result);
//   } catch (error: any) {
//     res.status(401).json({
//       message: error?.message ?? "Login failed",
//     });
//   }
// }

import { Request, Response } from "express";
import { loginUser } from "./login.services";
import { LoginDTO } from "./login.types";

export async function loginController(
  req: Request<{}, {}, LoginDTO>,
  res: Response
) {
  try {
    const { token, user } = await loginUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(401).json({
      message: error?.message ?? "Login failed",
    });
  }
}
