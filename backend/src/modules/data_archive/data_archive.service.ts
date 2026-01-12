import { prisma } from "../../config/prismaClient";
import fs from "fs";
import path from "path";
import { Parser } from "json2csv";

export const saveOneYearOldDataToArchive = async (): Promise<{status: number; message: string; deletedCount?: number; csvPath?: string; error?: any}> => {
  try {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const allData = await prisma.employeePayrollArchive.findMany();

    const filteredOldData = allData.filter((record) => {
      const payCode = record.PayCode?.trim();
      if (!payCode) return false;

      const parts = payCode.split("-");
      if (parts.length !== 4) return false;

      const [monthName, , endDayStr, yearStr] = parts;
      const endDay = parseInt(endDayStr);
      const year = parseInt(yearStr);
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();

      if (isNaN(monthIndex) || isNaN(endDay) || isNaN(year)) return false;

      const recordEndDate = new Date(year, monthIndex, endDay);
      return recordEndDate < oneYearAgo;
    });

    if (filteredOldData.length === 0) {
      return {
        status: 200,
        message: "No records older than 1 year found.",
        deletedCount: 0,
      };
    }

    const rootDir =  path.join(__dirname, "..", "..");
    const dirPath = path.join(rootDir, "uploads", "yearly_archive");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fields = Object.keys(filteredOldData[0]);
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(filteredOldData);

    const fileName = `emp_payroll_archive_${today
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.csv`;
    const filePath = path.join(dirPath, fileName);

    try {
      fs.writeFileSync(filePath, csv);
      console.log(`CSV saved at: ${filePath}`);
    } catch (csvError) {
      console.error("Failed to save CSV file:", csvError);
      return {
        status: 500,
        message: "CSV backup failed. No data was deleted.",
        error: csvError,
      };
    }

    const idsToDelete = filteredOldData.map((d) => d.id);
    const deleteResult = await prisma.employeePayrollArchive.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    return {
      status: 200,
      message: `${deleteResult.count} records older than 1 year saved to CSV and deleted.`,
      deletedCount: deleteResult.count,
      csvPath: filePath,
    };
  } catch (error) {
    console.error("Unexpected error in service:", error);
    return {
      status: 500,
      message: "Unexpected server error",
      error,
    };
  }
};





export const saveOneYearOldDataSummaryService = async (): Promise<{
    status: number;
    message: string;
    deletedCount?: number;
    csvPath?: string;
    error?: any;
  }> => {
    try {
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
  
      const allData = await prisma.employeeSummary.findMany();
  
      const filteredOldData = allData.filter((record) => {
        const payCode = record.PayCode?.trim();
        if (!payCode) return false;
  
        const parts = payCode.split("-");
        if (parts.length !== 4) return false;
  
        const [monthName, , endDayStr, yearStr] = parts;
        const endDay = parseInt(endDayStr);
        const year = parseInt(yearStr);
        const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
  
        if (isNaN(monthIndex) || isNaN(endDay) || isNaN(year)) return false;
  
        const recordEndDate = new Date(year, monthIndex, endDay);
        return recordEndDate < oneYearAgo;
      });
  
      if (filteredOldData.length === 0) {
        return {
          status: 200,
          message: "No records older than 1 year found.",
          deletedCount: 0,
        };
      }
  
      const rootDir =  path.join(__dirname, "..", "..");
      const dirPath = path.join(rootDir, "uploads", "yearly_archive");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
  
      const fields = Object.keys(filteredOldData[0]);
      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(filteredOldData);
  
      const fileName = `emp_summary_notcomputed_${today
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.csv`;
      const filePath = path.join(dirPath, fileName);
  
      try {
        fs.writeFileSync(filePath, csv);
        console.log(`CSV saved at: ${filePath}`);
      } catch (csvError) {
        console.error("Failed to save CSV file:", csvError);
        return {
          status: 500,
          message: "CSV backup failed. No data was deleted.",
          error: csvError,
        };
      }
  
      const idsToDelete = filteredOldData.map((d) => d.PayCode);
      const deleteResult = await prisma.employeeSummary.deleteMany({
        where: {
          PayCode: { in: idsToDelete },
        },
      });
  
      return {
        status: 200,
        message: `${deleteResult.count} records older than 1 year saved to CSV and deleted.`,
        deletedCount: deleteResult.count,
        csvPath: filePath,
      };
    } catch (error) {
      console.error("Unexpected error in service:", error);
      return {
        status: 500,
        message: "Unexpected server error",
        error,
      };
    }
  };
