import axios from "axios";
import { prisma } from "../config/prismaClient";






// export const hrApi = axios.create({
//   baseURL: process.env.HR_API_BASE_URL,
//   headers: {
//     "X-PAYROLL-TOKEN": process.env.HR_API_TOKEN!,
//     "Content-Type": "application/json",
//   },
// });


const HR_API_BASE_URL = process.env.HR_API_BASE_URL;

const HR_API_BASE_URL_LOCAL = process.env.HR_API_BASE_URL_LOCAL;

const HR_API_TOKEN = process.env.HR_API_TOKEN;

export const hrApi = async () => {

  const localMode = await prisma.localMode.findFirst({
      orderBy: {
        created_at: "desc",
      },
    });

  const baseURL = localMode?.local_mode ? HR_API_BASE_URL_LOCAL: HR_API_BASE_URL;

  return axios.create({

    baseURL,

    headers: {

      "X-PAYROLL-TOKEN":
        HR_API_TOKEN,

      "Content-Type":
        "application/json",

    },

  });

};



