import { Router } from 'express';

import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllBooks);

router.get('/:id', getBookById);

router.post('/', authMiddleware, addBook);

router.patch('/:id', authMiddleware, updateBook);

router.delete('/:id', authMiddleware, deleteBook);

export default router;