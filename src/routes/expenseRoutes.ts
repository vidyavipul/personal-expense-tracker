import { Router } from 'express';
import { createExpense, getUserExpenses, updateExpense, partialUpdateExpense, deleteExpense } from '../controllers/expenseController';

const router = Router();

router.post('/', createExpense);
router.get('/user/:id', getUserExpenses);
router.put('/:id', updateExpense);
router.patch('/:id', partialUpdateExpense);
router.delete('/:id', deleteExpense);

export default router;