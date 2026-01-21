// import { LoginDTO } from "./login.types";
// import { prisma } from "../../config/prismaClient";
// import bcrypt from "bcryptjs";

// export async function loginUser(params: LoginDTO) {
//   const { username, password } = params;

//   const user = await prisma.user.findUnique({
//     where: { username },
//   });

//   if (!user) {
//     throw new Error("Invalid username or password");
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     throw new Error("Invalid username or password");
//   }

//   return {
//     user: {
//       id: user.id,
//       username: user.username,
//       role: user.role,
//     },
//   };
// }


import { LoginDTO } from "./login.types";
import { prisma } from "../../config/prismaClient";
import bcrypt from "bcryptjs";
import { signToken } from "../../utils/jwt";

export async function loginUser(params: LoginDTO) {
  const { username, password } = params;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}
