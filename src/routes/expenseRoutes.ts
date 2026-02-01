import { Router } from 'express';
import { createExpense, getUserExpenses, updateExpense, partialUpdateExpense } from '../controllers/expenseController';

const router = Router();

router.post('/', createExpense);
router.get('/user/:id', getUserExpenses);
router.put('/:id', updateExpense);
router.patch('/:id', partialUpdateExpense);

export default router;