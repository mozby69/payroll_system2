import { Router} from 'express';
import preparePayrollRoutes from '../modules/prepare_payroll/prepare_payroll.routes';
import importRoutes from '../modules/import/import.routes';

import apiRoutes from '../modules/api/api.routes';



const router = Router();


router.use('/prepare-payroll',preparePayrollRoutes);
router.use('/import',importRoutes);

router.use('/process', apiRoutes)






export default router;