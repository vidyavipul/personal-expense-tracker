import { Router } from 'express';
import { createUser, getUserById, getAllUsers, updateUser, partialUpdateUser, changeUserEmail } from '../controllers/userController';
import { getUserExpenses } from '../controllers/expenseController';
import { getUserSummary } from '../controllers/summaryController';

const router = Router();

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id', partialUpdateUser);
router.post('/:id/change-email', changeUserEmail);
router.get('/:id/expenses', getUserExpenses);
router.get('/:id/summary', getUserSummary);

export default router;
