import { Router} from 'express';
import preparePayrollRoutes from '../modules/prepare_payroll/prepare_payroll.routes';
import importRoutes from '../modules/import/import.routes';

import apiRoutes from '../modules/api/api.routes';

import loginRoutes from "../modules/login/login.routes"
import authRoutes from "../modules/auth/auth.routes";
import employeeRoutes from "../modules/emp/emp.routes";
import bonusRoutes from "../modules/bonus/bonus.routes";
import payrollArchiveRoutes from "../modules/payroll_archive/payroll_archive.routes";


const router = Router();


router.use('/prepare-payroll',preparePayrollRoutes);
router.use('/import',importRoutes);

router.use('/process', apiRoutes)

router.use("/auth", loginRoutes);
router.use("/auth", authRoutes); 

router.use("/bonus", bonusRoutes);


router.use("/list", employeeRoutes);
router.use("/payroll-archive", payrollArchiveRoutes);






export default router;