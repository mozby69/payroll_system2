import { Router} from 'express';
import preparePayrollRoutes from '../modules/prepare_payroll/prepare_payroll.routes';
import importRoutes from '../modules/import/import.routes';



const router = Router();


router.use('/prepare-payroll',preparePayrollRoutes);
router.use('/import',importRoutes);

export default router;