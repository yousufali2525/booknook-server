import { Router } from 'express';
import {
  borrowBook,
  getUserBorrows,
  returnBook,
} from '../controllers/borrowController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authMiddleware, getUserBorrows);
router.post('/', authMiddleware, borrowBook);
router.delete('/:id', authMiddleware, returnBook);
export default router;