import type { Response } from 'express';
import { Book } from '../models/Book.js';
import { Borrow } from '../models/Borrow.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export async function borrowBook(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { bookId, returnDate } = req.body;

    const userEmail = req.user?.email?.toLowerCase().trim();
    const userName = req.user?.name;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'Please login first.'
      });
      return;
    }

    if (!bookId || !returnDate) {
      res.status(400).json({
        success: false,
        message: 'Book ID and return date are required.'
      });
      return;
    }

    const selectedReturnDate = new Date(returnDate);

    if (
      Number.isNaN(selectedReturnDate.getTime()) ||
      selectedReturnDate <= new Date()
    ) {
      res.status(400).json({
        success: false,
        message: 'Please select a valid future return date.'
      });
      return;
    }

    const existingBorrow = await Borrow.findOne({
      bookId,
      userEmail,
      status: 'borrowed'
    });

    if (existingBorrow) {
      res.status(400).json({
        success: false,
        message: 'You have already borrowed this book!'
      });
      return;
    }

    const book = await Book.findById(bookId);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
      return;
    }

    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        availableCopies: { $gt: 0 }
      },
      {
        $inc: { availableCopies: -1 }
      },
      {
        new: true
      }
    );

    if (!updatedBook) {
      res.status(400).json({
        success: false,
        message: 'This book is currently out of stock!'
      });
      return;
    }

    try {
      const newBorrow = new Borrow({
        bookId: String(updatedBook._id),
        bookTitle: updatedBook.title,
        bookImage: updatedBook.image,
        category: updatedBook.category,
        userName: userName || userEmail.split('@')[0],
        userEmail,
        borrowDate: new Date().toISOString().split('T')[0],
        returnDate: selectedReturnDate.toISOString().split('T')[0],
        status: 'borrowed'
      });

      await newBorrow.save();

      res.status(201).json({
        success: true,
        message: 'Book borrowed successfully!',
        borrow: newBorrow
      });
    } catch (error) {
      await Book.updateOne(
        { _id: bookId },
        { $inc: { availableCopies: 1 } }
      );

      throw error;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong.';

    res.status(500).json({
      success: false,
      message
    });
  }
}

export async function getUserBorrows(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userEmail = req.user?.email?.toLowerCase().trim();

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'Please login first.'
      });
      return;
    }

    const borrows = await Borrow.find({
      userEmail
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: borrows.length,
      borrows,
      data: borrows
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong.';

    res.status(500).json({
      success: false,
      message
    });
  }
}

export async function returnBook(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email?.toLowerCase().trim();

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'Please login first.'
      });
      return;
    }

    const borrowRecord = await Borrow.findOneAndUpdate(
      {
        _id: id,
        userEmail,
        status: 'borrowed'
      },
      {
        $set: { status: 'returned' }
      },
      {
        new: true
      }
    );

    if (!borrowRecord) {
      const existingRecord = await Borrow.findOne({
        _id: id,
        userEmail
      });

      if (!existingRecord) {
        res.status(404).json({
          success: false,
          message: 'Borrow record not found.'
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: 'Book is already returned.'
      });
      return;
    }

    await Book.updateOne(
      { _id: borrowRecord.bookId },
      { $inc: { availableCopies: 1 } }
    );

    res.json({
      success: true,
      message: 'Book returned successfully!'
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong.';

    res.status(500).json({
      success: false,
      message
    });
  }
}

export default {
  borrowBook,
  getUserBorrows,
  returnBook
};