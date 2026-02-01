import { Router } from 'express';
import { createExpense, getUserExpenses } from '../controllers/expenseController';

const router = Router();

router.post('/', createExpense);
router.get('/user/:id', getUserExpenses);

export default router;