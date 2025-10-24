const express = require('express');
const { dbHelpers } = require('./database');
const { authenticateToken } = require('./middleware/authMiddleware');

const router = express.Router();

// Get all incomes for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const incomes = await dbHelpers.all(
            'SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC, created_at DESC',
            [req.user.userId]
        );
        res.json({ success: true, incomes });
    } catch (error) {
        console.error('Get incomes error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch incomes' });
    }
});

// Add new income
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { source, amount, date } = req.body;
        if (!source || !amount || !date) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const result = await dbHelpers.run(
            'INSERT INTO incomes (user_id, source, amount, date) VALUES (?, ?, ?, ?)',
            [req.user.userId, source, amount, date]
        );

        const newIncome = await dbHelpers.get('SELECT * FROM incomes WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, message: 'Income added successfully', income: newIncome });
    } catch (error) {
        console.error('Add income error:', error);
        res.status(500).json({ success: false, message: 'Failed to add income' });
    }
});

// Delete income
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userIncome = await dbHelpers.get('SELECT id FROM incomes WHERE id = ? AND user_id = ?', [id, req.user.userId]);
        if (!userIncome) {
            return res.status(404).json({ success: false, message: 'Income not found' });
        }
        await dbHelpers.run('DELETE FROM incomes WHERE id = ?', [id]);
        res.json({ success: true, message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete income' });
    }
});

module.exports = router;
