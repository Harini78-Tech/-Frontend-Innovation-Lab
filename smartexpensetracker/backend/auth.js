const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers } = require('./database');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '15798850bcb10b3b280653a34cb4cdd7c1749fbd4e948fdb01a6ece21a1cdfef759002fa9aa2a1c3ee2228f0ae391b9d54a1bb99e95601403b11e24e408dbcbe';

// Register user
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body);
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const existingUser = await dbHelpers.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await dbHelpers.run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        console.log('✅ User registered with ID:', result.insertId);

        const token = jwt.sign({ userId: result.insertId, email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { id: result.insertId, name, email }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login attempt for:', req.body.email);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await dbHelpers.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        console.log('✅ Login successful for user:', user.email);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

module.exports = { router };
