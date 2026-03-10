import {Router} from "express"
import { addEmployeeLoanController, 
    getAllLoans, 
    getLoanLedgerById, 
    getEmpLoanById,
    updateEmployeeLoanController, 
    closedEmployeeLoanController, 
    payEmployeeLoanController,
    getLoansByEmpCodeController,
    getBonusRules,
    searchEmployeeController,
    getLoanSummaryController
    } from "./loan.controller";



const router = Router();

router.post('/loans-add',addEmployeeLoanController);

router.get('/all-loans', getAllLoans);

router.get("/loans/:loan_id/details", getLoanLedgerById);

router.get("/by-id/:loan_id",getEmpLoanById);

router.patch("/emp/:loan_id", updateEmployeeLoanController);

router.patch("/emp-loan/:loan_id", closedEmployeeLoanController);

router.post("/loans/:loan_id/pay", payEmployeeLoanController);

router.get('/employees/search',searchEmployeeController);

router.post("/by-empcode", getLoansByEmpCodeController);
router.get("/bonus-rules", getBonusRules);
router.get("/get-loan-summary", getLoanSummaryController);


export default router;