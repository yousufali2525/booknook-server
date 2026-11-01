import mongoose, { Schema } from 'mongoose';

export interface IBook {
  _id?: string;
  title: string;
  author: string;
  category: string;
  image: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  userName: string;
  userEmail: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookSchema = new Schema<IBook>(
  {
    _id: {
      type: String
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
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
    rating: {
      type: Number,
      default: 5.0
    }
  },
  {
    timestamps: true
  }
);

export const Book =
  mongoose.models.Book || mongoose.model<IBook>('Book', bookSchema);

export default Book;