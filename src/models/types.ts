export interface IBook {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  rating?: number;
}

export interface IBorrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  status: 'active' | 'returned';
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  photoURL?: string;
  passwordHash?: string;
  createdAt: string;
}