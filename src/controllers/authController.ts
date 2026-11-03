import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, clientUser } = req.body;
    let email = '';
    let name = '';
    let photoUrl = '';
    if (credential) {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const payloadStr = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadStr);
        email = payload.email;
        name = payload.name;
        photoUrl = payload.picture;
      }
    }
    if (!email && clientUser?.email) {
      email = clientUser.email;
      name = clientUser.name;
      photoUrl = clientUser.photoUrl || clientUser.image;
    }

    if (!email) {
      res.status(400).json({ success: false, message: 'Google authentication failed' });
      return;
    }
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({name: name || email.split('@')[0],
        email: email.toLowerCase(),
        photoUrl: photoUrl || '',
        role: 'user',
        authProvider: 'google'
      });
    } else {
      if (photoUrl && user.photoUrl !== photoUrl) {user.photoUrl = photoUrl;
        await user.save();
      }
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, photoUrl } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      photoUrl: photoUrl || '',
      role: 'user',
      authProvider: 'local'
    });
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const user = await User.findOne({ email: email.toLowerCase(), password: hashedPassword });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};