import { Response } from 'express';
import { Book } from '../models/Book.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const findBookById = async (id: string) => {
  return Book.findOne({ _id: id });
};

export async function getAllBooks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category, search, sort, limit } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'All') {
      filter.category = {
        $regex: new RegExp(`^${String(category)}$`, 'i'),
      };
    }

    if (search) {
      const searchText = String(search);

      filter.$or = [
        { title: { $regex: searchText, $options: 'i' } },
        { author: { $regex: searchText, $options: 'i' } },
      ];
    }

    let query = Book.find(filter);

    if (sort === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    if (limit) {
      const parsedLimit = Number(limit);

      if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const books = await query.exec();

    res.json({
      success: true,
      count: books.length,
      books,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch books.',
    });
  }
}

export async function getMyBooks(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        message: 'Please login first.',
      });
      return;
    }

    const books = await Book.find({
      userEmail: req.user.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: books.length,
      books,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch your books.',
    });
  }
}

export async function getBookById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const book = await findBookById(req.params.id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
      return;
    }

    res.json({
      success: true,
      book,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch book.',
    });
  }
}

export async function addBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.id || !req.user.email) {
      res.status(401).json({
        success: false,
        message: 'Please login first.',
      });
      return;
    }

    const {
      title,
      author,
      category,
      image,
      description,
      totalCopies,
    } = req.body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category?.trim() ||
      !image?.trim() ||
      !description?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
      return;
    }

    const copies = Number(totalCopies);

    if (!Number.isInteger(copies) || copies < 1) {
      res.status(400).json({
        success: false,
        message: 'Total copies must be at least 1.',
      });
      return;
    }

    const newBook = new Book({
      _id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      image: image.trim(),
      description: description.trim(),
      totalCopies: copies,
      availableCopies: copies,
      userName: req.user.name || 'Member',
      userEmail: req.user.email.toLowerCase(),
      rating: 5,
    });

    const savedBook = await newBook.save();

    res.status(201).json({
      success: true,
      message: 'Book added successfully!',
      book: savedBook,
      data: savedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add book.',
    });
  }
}

export async function updateBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        message: 'Please login first.',
      });
      return;
    }

    const book = await Book.findOne({
      _id: req.params.id,
      userEmail: req.user.email.toLowerCase(),
    });

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found or you do not have permission to edit it.',
      });
      return;
    }

    const { title, author, category, image, description, totalCopies } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ success: false, message: 'Invalid book title.' });
        return;
      }
      book.title = title.trim();
    }

    if (author !== undefined) {
      if (typeof author !== 'string' || !author.trim()) {
        res.status(400).json({ success: false, message: 'Invalid author name.' });
        return;
      }
      book.author = author.trim();
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        res.status(400).json({ success: false, message: 'Invalid category.' });
        return;
      }
      book.category = category.trim();
    }

    if (image !== undefined) {
      if (typeof image !== 'string' || !image.trim()) {
        res.status(400).json({ success: false, message: 'Invalid image URL.' });
        return;
      }
      book.image = image.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        res.status(400).json({ success: false, message: 'Invalid description.' });
        return;
      }
      book.description = description.trim();
    }

    if (totalCopies !== undefined) {
      const newTotalCopies = Number(totalCopies);

      if (!Number.isInteger(newTotalCopies) || newTotalCopies < 1) {
        res.status(400).json({
          success: false,
          message: 'Total copies must be at least 1.',
        });
        return;
      }

      const borrowedCopies = book.totalCopies - book.availableCopies;

      if (newTotalCopies < borrowedCopies) {
        res.status(400).json({
          success: false,
          message: `At least ${borrowedCopies} copies are currently borrowed.`,
        });
        return;
      }

      book.totalCopies = newTotalCopies;
      book.availableCopies = newTotalCopies - borrowedCopies;
    }

    const updatedBook = await book.save();

    res.json({
      success: true,
      message: 'Book updated successfully!',
      book: updatedBook,
      data: updatedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update book.',
    });
  }
}

export async function deleteBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        message: 'Please login first.',
      });
      return;
    }

    const deletedBook = await Book.findOneAndDelete({
      _id: req.params.id,
      userEmail: req.user.email.toLowerCase(),
    });

    if (!deletedBook) {
      res.status(404).json({
        success: false,
        message: 'Book not found or you do not have permission to delete it.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete book.',
    });
  }
}

export default {
  getAllBooks,
  getMyBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
};