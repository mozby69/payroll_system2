import { Router} from 'express';
import preparePayrollRoutes from '../modules/prepare_payroll/prepare_payroll.routes';
import addLoanRoutes from "../modules/loans/loan.routes";
import importRoutes from '../modules/import/import.routes';

import apiRoutes from '../modules/api/api.routes';

import loginRoutes from "../modules/login/login.routes"
import authRoutes from "../modules/auth/auth.routes";
import employeeRoutes from "../modules/emp/emp.routes";
import bonusRoutes from "../modules/bonus/bonus.routes";
import payrollArchiveRoutes from "../modules/payroll_archive/payroll_archive.routes";
import filterRoutes from "../modules/filters/filter.routes";
import generalRoutes from "../modules/general/general.routes";
import allowanceRoutes from "../modules/allowance/allowance.routes";


const router = Router();


router.use('/prepare-payroll',preparePayrollRoutes);
router.use('/import',importRoutes);

router.use('/process', apiRoutes)

router.use("/auth", loginRoutes);
router.use("/auth", authRoutes); 

router.use("/bonus", bonusRoutes);


router.use("/list", employeeRoutes);
router.use("/payroll-archive", payrollArchiveRoutes);

router.use("/opt", filterRoutes);

router.use("/general", generalRoutes)
router.use("/allowance",allowanceRoutes);
router.use("/approved", addLoanRoutes);
router.use("/get-loan", addLoanRoutes);
router.use("/get-loan-ledger", addLoanRoutes);
router.use("/get-emp-loan", addLoanRoutes);
router.use("/update",addLoanRoutes);
router.use("/closed", addLoanRoutes);
router.use("/early", addLoanRoutes);







export default router;