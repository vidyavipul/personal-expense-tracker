import { Router } from 'express';
import { createUser, getUserById, getAllUsers } from '../controllers/userController';
import { getUserExpenses } from '../controllers/expenseController';
import { getUserSummary } from '../controllers/summaryController';

const router = Router();

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/expenses', getUserExpenses);
router.get('/:id/summary', getUserSummary);

export default router;
