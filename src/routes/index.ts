import { Router } from 'express';
import userRoutes from './userRoutes';
import expenseRoutes from './expenseRoutes';
import { getUserSummary } from '../controllers/summaryController';

const router = Router();

router.use('/users', userRoutes);
router.use('/expenses', expenseRoutes);
router.get('/summary/:id', getUserSummary);

export default router;
