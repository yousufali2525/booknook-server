import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured in the .env file");
}
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
interface Book {
  _id: string;
  title: string;
  author: string;
  category: 'Fiction' | 'Science' | 'History' | 'Kids' | 'Others' | string;
  image: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  userName: string;
  userEmail: string;
  rating?: number;
  createdAt: string;
}
interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userEmail: string;
  userName: string;
  borrowDate: string;
  returnDate: string;
  createdAt: string;
}
interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  createdAt: string;
}
const initial20Books: Book[] = [
  {
    _id: "book_01",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    description: "A classic tale of ambition, love, and tragedy in the Roaring Twenties on Long Island.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-30T10:00:00.000Z"
  },
  {
    _id: "book_02",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "Science",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    description: "Explores the deepest questions of our cosmos, black holes, general relativity, and time.",
    totalCopies: 4,
    availableCopies: 3,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-29T10:00:00.000Z"
  },
  {
    _id: "book_03",
    title: "Sapiens: A Brief History",
    author: "Yuval Noah Harari",
    category: "History",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    description: "How an ordinary ape species overcame evolutionary odds to become the dominant ruler of Earth.",
    totalCopies: 6,
    availableCopies: 5,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-28T10:00:00.000Z"
  },
  {
    _id: "book_04",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    category: "Kids",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    description: "A poetic tale of loneliness, friendship, and love told by a fallen aviator and a prince.",
    totalCopies: 4,
    availableCopies: 3,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-27T10:00:00.000Z"
  },
  {
    _id: "book_05",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Others",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600",
    description: "Personal writings of the Roman Emperor Marcus Aurelius on Stoic philosophy and ethics.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.7,
    createdAt: "2026-10-26T10:00:00.000Z"
  },
  {
    _id: "book_06",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Others",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    description: "An easy and proven way to build good habits and break bad ones using behavioral science.",
    totalCopies: 6,
    availableCopies: 5,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-25T10:00:00.000Z"
  },
  {
    _id: "book_07",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    description: "The unforgettable novel of a childhood in a sleepy town and a crisis of conscience.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-24T10:00:00.000Z"
  },
  {
    _id: "book_08",
    title: "1984",
    author: "George Orwell",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&q=80&w=600",
    description: "A chilling dystopian masterwork depicting surveillance, thought control, and authority.",
    totalCopies: 6,
    availableCopies: 5,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-23T10:00:00.000Z"
  },
  {
    _id: "book_09",
    title: "Cosmos",
    author: "Carl Sagan",
    category: "Science",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600",
    description: "A journey through 15 billion years of cosmic evolution exploring science and humanity.",
    totalCopies: 4,
    availableCopies: 3,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-22T10:00:00.000Z"
  },
  {
    _id: "book_10",
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    category: "Science",
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
    description: "A classic look at evolutionary biology and how genes drive animal and human behavior.",
    totalCopies: 4,
    availableCopies: 3,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.7,
    createdAt: "2026-10-21T10:00:00.000Z"
  },
  {
    _id: "book_11",
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    category: "History",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
    description: "An examination of how geographic and environmental factors shaped human civilization.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-20T10:00:00.000Z"
  },
  {
    _id: "book_12",
    title: "The Silk Roads: A New History",
    author: "Peter Frankopan",
    category: "History",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600",
    description: "An epic reassessment of world history focusing on ancient Asian and European trade networks.",
    totalCopies: 4,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.7,
    createdAt: "2026-10-19T10:00:00.000Z"
  },
  {
    _id: "book_13",
    title: "Charlotte's Web",
    author: "E.B. White",
    category: "Kids",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600",
    description: "The heartwarming story of a young pig named Wilbur and his wise spider friend Charlotte.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-18T10:00:00.000Z"
  },
  {
    _id: "book_14",
    title: "Where the Wild Things Are",
    author: "Maurice Sendak",
    category: "Kids",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",
    description: "Max sets sail across the sea to where the wild things are and becomes king of all beasts.",
    totalCopies: 4,
    availableCopies: 3,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-17T10:00:00.000Z"
  },
  {
    _id: "book_15",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Others",
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600",
    description: "Nobel laureate Daniel Kahneman reveals the dual cognitive systems driving human decisions.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-16T10:00:00.000Z"
  },
  {
    _id: "book_16",
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Fiction",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    description: "A magical tale of Santiago, an Andalusian shepherd boy who journeys in search of treasure.",
    totalCopies: 6,
    availableCopies: 5,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-15T10:00:00.000Z"
  },
  {
    _id: "book_17",
    title: "Astrophysics for People in a Hurry",
    author: "Neil deGrasse Tyson",
    category: "Science",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    description: "Essential cosmic wisdom made bite-sized, covering quantum mechanics and astrophysics.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.7,
    createdAt: "2026-10-14T10:00:00.000Z"
  },
  {
    _id: "book_18",
    title: "A People's History of the US",
    author: "Howard Zinn",
    category: "History",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
    description: "An alternate perspective on history told from the viewpoint of working people and movements.",
    totalCopies: 4,
    availableCopies: 3,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.7,
    createdAt: "2026-10-13T10:00:00.000Z"
  },
  {
    _id: "book_19",
    title: "Matilda",
    author: "Roald Dahl",
    category: "Kids",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600",
    description: "The extraordinary girl with a sharp mind and telekinesis who takes on Miss Trunchbull.",
    totalCopies: 6,
    availableCopies: 5,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.9,
    createdAt: "2026-10-12T10:00:00.000Z"
  },
  {
    _id: "book_20",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Others",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600",
    description: "Rules for focused success in a distracted world, teaching mastery over complex skills.",
    totalCopies: 5,
    availableCopies: 4,
    userName: "Library Curator",
    userEmail: "curator@booknook.com",
    rating: 4.8,
    createdAt: "2026-10-11T10:00:00.000Z"
  }
];
let inMemoryBooks: Book[] = [...initial20Books];
let inMemoryBorrows: Borrow[] = [];
let inMemoryUsers: User[] = [
  {
    _id: "user_curator",
    name: "Library Curator",
    email: "curator@booknook.com",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    createdAt: "2026-10-01T00:00:00.000Z"
  }
];
let db: any = null;
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  MongoClient.connect(MONGODB_URI)
    .then(async (client) => {
      db = client.db('booknook');
      console.log('BookNook MongoDB Atlas connected successfully to database: booknook');
      const count = await db.collection('books').countDocuments();
      if (count === 0) {
        await db.collection('books').insertMany(initial20Books);
        console.log('Seeded 20 initial books to MongoDB Atlas!');
      }
    })
    .catch((err) => {
      console.error('MongoDB Connection Error:', err);
    });
}
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
  } catch (err) {
  }
  next();
};
app.use(verifyToken);
const handleGetBooks = async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const categoryParam = req.query.category as string | undefined;
    const userEmailParam = req.query.userEmail as string | undefined;
    if (db) {
      let query: any = {};
      if (categoryParam && categoryParam !== 'All') {
        query.category = { $regex: new RegExp(`^${categoryParam}$`, 'i') };
      }
      if (userEmailParam) {
        query.userEmail = userEmailParam.toLowerCase();
      }
      let cursor = db.collection('books').find(query).sort({ createdAt: -1 });
      if (limitParam) {
        cursor = cursor.limit(limitParam);
      }
      const books = await cursor.toArray();
      return res.json(books);
    }
    let result = [...inMemoryBooks];
    if (categoryParam && categoryParam !== 'All') {
      result = result.filter(b => b.category.toLowerCase() === categoryParam.toLowerCase());
    }
    if (userEmailParam) {
      result = result.filter(b => b.userEmail.toLowerCase() === userEmailParam.toLowerCase());
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (limitParam) {
      result = result.slice(0, limitParam);
    }
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.get('/books', handleGetBooks);
app.get('/api/books', handleGetBooks);
const handleGetBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (db) {
      let filter: any = { _id: id };
      if (ObjectId.isValid(id)) {
        filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
      }
      const book = await db.collection('books').findOne(filter);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.json(book);
    }
    const book = inMemoryBooks.find(b => b._id === id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    return res.json(book);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.get('/books/:id', handleGetBookById);
app.get('/api/books/:id', handleGetBookById);
const handleCreateBook = async (req: Request, res: Response) => {
  try {
    const { title, author, category, image, description, totalCopies, availableCopies, userName, userEmail } = req.body;
    if (!title || !author || !category || !image || !description) {
      return res.status(400).json({ error: "Title, author, category, image, and description are required." });
    }
    const parsedTotal = Number(totalCopies) || 1;
    const parsedAvailable = availableCopies !== undefined ? Number(availableCopies) : parsedTotal;
    const newBook: Book = {
      _id: Date.now().toString(),
      title,
      author,
      category,
      image,
      description,
      totalCopies: parsedTotal,
      availableCopies: parsedAvailable,
      userName: userName || "Book Lover",
      userEmail: (userEmail || "").toLowerCase(),
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    if (db) {
      const result = await db.collection('books').insertOne(newBook);
      return res.status(201).json({ ...newBook, _id: result.insertedId.toString() });
    }
    inMemoryBooks.unshift(newBook);
    return res.status(201).json(newBook);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.post('/books', handleCreateBook);
app.post('/api/books', handleCreateBook);
const handleUpdateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;
    if (updateData.totalCopies !== undefined) {
      updateData.totalCopies = Number(updateData.totalCopies);
    }
    if (updateData.availableCopies !== undefined) {
      updateData.availableCopies = Number(updateData.availableCopies);
    }
    if (db) {
      let filter: any = { _id: id };
      if (ObjectId.isValid(id)) {
        filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
      }
      const result = await db.collection('books').findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: 'after' }
      );
      if (!result) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.json(result);
    }
    const index = inMemoryBooks.findIndex(b => b._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Book not found" });
    }
    inMemoryBooks[index] = { ...inMemoryBooks[index], ...updateData };
    return res.json(inMemoryBooks[index]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.patch('/books/:id', handleUpdateBook);
app.patch('/api/books/:id', handleUpdateBook);
const handleDeleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (db) {
      let filter: any = { _id: id };
      if (ObjectId.isValid(id)) {
        filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
      }
      const result = await db.collection('books').deleteOne(filter);
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      return res.json({ success: true, message: "Book deleted successfully" });
    }
    const index = inMemoryBooks.findIndex(b => b._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Book not found" });
    }
    inMemoryBooks.splice(index, 1);
    return res.json({ success: true, message: "Book deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.delete('/books/:id', handleDeleteBook);
app.delete('/api/books/:id', handleDeleteBook);
const handleBorrowBook = async (req: Request, res: Response) => {
  try {
    const { bookId, userEmail, userName, returnDate } = req.body;
    if (!bookId || !userEmail || !returnDate) {
      return res.status(400).json({ error: "Book ID, User Email, and Return Date are required to borrow." });
    }
    const normalizedEmail = userEmail.toLowerCase();
    if (db) {
      let bookFilter: any = { _id: bookId };
      if (ObjectId.isValid(bookId)) {
        bookFilter = { $or: [{ _id: new ObjectId(bookId) }, { _id: bookId }] };
      }
      const existingBorrow = await db.collection('borrows').findOne({
        bookId: bookId,
        userEmail: normalizedEmail
      });
      if (existingBorrow) {
        return res.status(400).json({
          error: "You have already borrowed this book! Return it before borrowing again."
        });
      }
      const targetBook = await db.collection('books').findOne(bookFilter);
      if (!targetBook) {
        return res.status(404).json({ error: "Book not found" });
      }
      if (targetBook.availableCopies <= 0) {
        return res.status(400).json({ error: "Not Available. All copies are currently borrowed." });
      }
      await db.collection('books').updateOne(bookFilter, { $inc: { availableCopies: -1 } });
      const newBorrow: Borrow = {
        _id: new ObjectId().toString(),
        bookId,
        bookTitle: targetBook.title,
        bookImage: targetBook.image,
        userEmail: normalizedEmail,
        userName: userName || normalizedEmail.split('@')[0],
        borrowDate: new Date().toISOString(),
        returnDate,
        createdAt: new Date().toISOString()
      };
      await db.collection('borrows').insertOne(newBorrow);
      return res.status(201).json(newBorrow);
    }
    const alreadyBorrowed = inMemoryBorrows.some(
      b => b.bookId === bookId && b.userEmail.toLowerCase() === normalizedEmail
    );
    if (alreadyBorrowed) {
      return res.status(400).json({
        error: "You have already borrowed this book! Return it before borrowing again."
      });
    }
    const targetBook = inMemoryBooks.find(b => b._id === bookId);
    if (!targetBook) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (targetBook.availableCopies <= 0) {
      return res.status(400).json({ error: "Not Available. All copies are currently borrowed." });
    }
    targetBook.availableCopies -= 1;
    const newBorrow: Borrow = {
      _id: Date.now().toString(),
      bookId,
      bookTitle: targetBook.title,
      bookImage: targetBook.image,
      userEmail: normalizedEmail,
      userName: userName || normalizedEmail.split('@')[0],
      borrowDate: new Date().toISOString(),
      returnDate,
      createdAt: new Date().toISOString()
    };
    inMemoryBorrows.unshift(newBorrow);
    return res.status(201).json(newBorrow);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.post('/borrows', handleBorrowBook);
app.post('/api/borrows', handleBorrowBook);
const handleGetBorrows = async (req: Request, res: Response) => {
  try {
    const userEmail = (req.query.email as string || (req as any).user?.email || '').toLowerCase();
    if (db) {
      let query: any = {};
      if (userEmail) {
        query.userEmail = userEmail;
      }
      const borrows = await db.collection('borrows').find(query).sort({ createdAt: -1 }).toArray();
      return res.json(borrows);
    }
    let result = [...inMemoryBorrows];
    if (userEmail) {
      result = result.filter(b => b.userEmail.toLowerCase() === userEmail);
    }
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.get('/borrows', handleGetBorrows);
app.get('/api/borrows', handleGetBorrows);
const handleReturnBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (db) {
      let filter: any = { _id: id };
      if (ObjectId.isValid(id)) {
        filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
      }
      const borrow = await db.collection('borrows').findOne(filter);
      if (!borrow) {
        return res.status(404).json({ error: "Borrow record not found" });
      }
      await db.collection('borrows').deleteOne(filter);
      let bookFilter: any = { _id: borrow.bookId };
      if (ObjectId.isValid(borrow.bookId)) {
        bookFilter = { $or: [{ _id: new ObjectId(borrow.bookId) }, { _id: borrow.bookId }] };
      }
      await db.collection('books').updateOne(bookFilter, { $inc: { availableCopies: 1 } });
      return res.json({ success: true, message: "Book returned successfully" });
    }
    const index = inMemoryBorrows.findIndex(b => b._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Borrow record not found" });
    }
    const [borrow] = inMemoryBorrows.splice(index, 1);
    const targetBook = inMemoryBooks.find(b => b._id === borrow.bookId);
    if (targetBook) {
      targetBook.availableCopies += 1;
    }
    return res.json({ success: true, message: "Book returned successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
app.delete('/borrows/:id', handleReturnBook);
app.delete('/api/borrows/:id', handleReturnBook);
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password, photoUrl } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: "Password must have at least one uppercase letter." });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: "Password must have at least one lowercase letter." });
  }
  const normalizedEmail = email.toLowerCase();
  if (db) {
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    const newUser = {
      name,
      email: normalizedEmail,
      password,
      photoUrl: photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };
    const result = await db.collection('users').insertOne(newUser);
    const token = jwt.sign({ id: result.insertedId.toString(), email: normalizedEmail, name }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        photoUrl: newUser.photoUrl
      },
      token
    });
  }
  const existing = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: "User already exists with this email" });
  }
  const newUser: User = {
    _id: Date.now().toString(),
    name,
    email: normalizedEmail,
    password,
    photoUrl: photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString()
  };
  inMemoryUsers.push(newUser);
  const token = jwt.sign({ id: newUser._id, email: normalizedEmail, name }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      photoUrl: newUser.photoUrl
    },
    token
  });
});
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const normalizedEmail = email.toLowerCase();
  if (db) {
    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl
      },
      token
    });
  }
  const user = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user || (user.password && user.password !== password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl
    },
    token
  });
});
app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { email, name, photoUrl } = req.body;
  const userEmail = (email || "googleuser@booknook.com").toLowerCase();
  const userName = name || "Google User";
  const userPhoto = photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
  if (db) {
    let user = await db.collection('users').findOne({ email: userEmail });
    if (!user) {
      const newUser = {
        name: userName,
        email: userEmail,
        photoUrl: userPhoto,
        createdAt: new Date().toISOString()
      };
      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }
    const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl
      },
      token
    });
  }
  let user = inMemoryUsers.find(u => u.email.toLowerCase() === userEmail);
  if (!user) {
    user = {
      _id: Date.now().toString(),
      name: userName,
      email: userEmail,
      photoUrl: userPhoto,
      createdAt: new Date().toISOString()
    };
    inMemoryUsers.push(user);
  }
  const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl
    },
    token
  });
});
app.get('/', (req: Request, res: Response) => {
  res.json({
    project: 'BookNook – A Small Online Library API',
    status: 'Running',
    database: db ? 'Connected to MongoDB' : 'In-Memory Mode',
    booksCount: 20
  });
});
export default app;