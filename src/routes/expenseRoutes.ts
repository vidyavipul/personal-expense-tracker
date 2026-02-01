import { Router } from 'express';
import { createExpense } from '../controllers/expenseController';

const router = Router();

router.post('/', createExpense);

export default router;