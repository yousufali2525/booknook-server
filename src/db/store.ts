import 'dotenv/config';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { initialBooks } from './seedData.js';
dns.setServers(['8.8.8.8', '1.1.1.1']);
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
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  photoURL: { type: String, default: '' },
  passwordHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);
interface DBStructure {
  books: IBook[];
  borrows: IBorrow[];
  users: IUser[];
}
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const mongoURI = process.env.MONGODB_URI || '';
if (mongoURI) {
  mongoose
    .connect(mongoURI, { dbName: 'booknook' })
    .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
}
let memoryDB: DBStructure = {
  books: [...initialBooks],
  borrows: [],
  users: []
};
function loadDatabase(): DBStructure {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.books)) {
        return parsed;
      }
    }
    saveDatabase(memoryDB);
    return memoryDB;
  } catch (err) {
    return memoryDB;
  }
}
function saveDatabase(db: DBStructure): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    memoryDB = db;
  } catch (err) {
    memoryDB = db;
  }
}
export const dbStore = {
  getBooks(params?: { category?: string; search?: string; sort?: string; limit?: number }): IBook[] {
    const db = loadDatabase();
    let result = [...db.books];
    if (params?.category && params.category !== 'All') {
      result = result.filter(b => b.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      );
    }
    if (params?.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (params?.sort === 'copies') {
      result.sort((a, b) => b.availableCopies - a.availableCopies);
    } else if (params?.sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (params?.limit && params.limit > 0) {
      result = result.slice(0, params.limit);
    }
    return result;
  },
  getBookById(id: string): IBook | null {
    const db = loadDatabase();
    return db.books.find(b => b._id === id) || null;
  },
  addBook(data: Omit<IBook, '_id' | 'createdAt'>): IBook {
    const db = loadDatabase();
    const newBook: IBook = {
      ...data,
      _id: 'book_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };
    db.books.unshift(newBook);
    saveDatabase(db);
    return newBook;
  },
  updateBook(id: string, updates: Partial<IBook>): IBook | null {
    const db = loadDatabase();
    const index = db.books.findIndex(b => b._id === id);
    if (index === -1) return null;
    db.books[index] = {
      ...db.books[index],
      ...updates,
      _id: db.books[index]._id
    };
    saveDatabase(db);
    return db.books[index];
  },
  deleteBook(id: string): boolean {
    const db = loadDatabase();
    const initLength = db.books.length;
    db.books = db.books.filter(b => b._id !== id);
    if (db.books.length !== initLength) {
      saveDatabase(db);
      return true;
    }
    return false;
  },
  incrementBookCopies(id: string, amount: number): IBook | null {
    const db = loadDatabase();
    const index = db.books.findIndex(b => b._id === id);
    if (index === -1) return null;
    const book = db.books[index];
    const newAvailable = Math.max(0, Math.min(book.totalCopies, book.availableCopies + amount));
    db.books[index] = {
      ...book,
      availableCopies: newAvailable
    };
    saveDatabase(db);
    return db.books[index];
  },
  getBorrowsByUser(userEmail: string): IBorrow[] {
    const db = loadDatabase();
    return db.borrows.filter(
      b => b.userEmail.toLowerCase() === userEmail.toLowerCase() && b.status === 'active'
    );
  },
  hasActiveBorrow(bookId: string, userEmail: string): boolean {
    const db = loadDatabase();
    return db.borrows.some(
      b => b.bookId === bookId &&
           b.userEmail.toLowerCase() === userEmail.toLowerCase() &&
           b.status === 'active'
    );
  },
  addBorrow(data: Omit<IBorrow, '_id' | 'status'>): IBorrow {
    const db = loadDatabase();
    const newBorrow: IBorrow = {
      ...data,
      _id: 'borrow_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      status: 'active'
    };
    db.borrows.unshift(newBorrow);
    saveDatabase(db);
    return newBorrow;
  },
  returnBorrow(borrowId: string, userEmail: string): IBorrow | null {
    const db = loadDatabase();
    const index = db.borrows.findIndex(
      b => b._id === borrowId && b.userEmail.toLowerCase() === userEmail.toLowerCase()
    );
    if (index === -1) return null;
    const [removed] = db.borrows.splice(index, 1);
    saveDatabase(db);
    return removed;
  },
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const found: any = await User.findOne({ email: email.toLowerCase() });
      if (found) {
        return {
          _id: found._id.toString(),
          name: found.name,
          email: found.email,
          photoURL: found.photoURL || '',
          passwordHash: found.passwordHash || '',
          createdAt: found.createdAt ? new Date(found.createdAt).toISOString() : new Date().toISOString()
        };
      }
    } catch (e) {}
    const db = loadDatabase();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async getUserById(id: string): Promise<IUser | null> {
    try {
      const found: any = await User.findById(id);
      if (found) {
        return {
          _id: found._id.toString(),
          name: found.name,
          email: found.email,
          photoURL: found.photoURL || '',
          passwordHash: found.passwordHash || '',
          createdAt: found.createdAt ? new Date(found.createdAt).toISOString() : new Date().toISOString()
        };
      }
    } catch (e) {}
    const db = loadDatabase();
    return db.users.find(u => u._id ===id) || null;
  },
  async createUser(data: { name: string; email: string; photoURL: string; passwordHash?: string }): Promise<IUser> {
    let mongoId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    try {
      const created: any = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        photoURL: data.photoURL,
        passwordHash: data.passwordHash
      });
      console.log('🎉 Successfully saved user to MongoDB Atlas users collection:', created.email);
      mongoId = created._id.toString();
    } catch (err) {
      console.error('❌ MongoDB User Save Error:', err);
    }
    const db = loadDatabase();
    const newUser: IUser = {
      _id: mongoId,
      name: data.name,
      email: data.email.toLowerCase(),
      photoURL: data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      passwordHash: data.passwordHash || '',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDatabase(db);
    return newUser;
  }
};