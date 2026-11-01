import mongoose, { Schema, Document } from 'mongoose';

export interface IBorrow extends Document {
  bookId: string;
  bookTitle: string;
  bookImage: string;
  category?: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  status: 'borrowed' | 'returned';
  createdAt?: Date;
  updatedAt?: Date;
}

const borrowSchema = new Schema<IBorrow>(
  {
    bookId: {
      type: String,
      required: true,
      trim: true
    },
    bookTitle: {
      type: String,
      required: true,
      trim: true
    },
    bookImage: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    borrowDate: {
      type: String,
      required: true
    },
    returnDate: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned'],
      default: 'borrowed'
    }
  },
  {
    timestamps: true
  }
);

export const Borrow =
  mongoose.models.Borrow ||
  mongoose.model<IBorrow>('Borrow', borrowSchema);

export default Borrow;