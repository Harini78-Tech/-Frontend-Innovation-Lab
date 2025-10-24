const express = require('express');
const { dbHelpers } = require('./database');
const { authenticateToken } = require('./middleware/authMiddleware');

const router = express.Router();

// Get all expenses for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const expenses = await dbHelpers.all(
            'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
            [req.user.userId]
        );

        res.json({ success: true, expenses });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
    }
});

// Add new expense
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, amount, category, date } = req.body;
        if (!name || !amount || !category || !date) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const result = await dbHelpers.run(
            'INSERT INTO expenses (user_id, name, amount, category, date) VALUES (?, ?, ?, ?, ?)',
            [req.user.userId, name, amount, category, date]
        );

        const newExpense = await dbHelpers.get('SELECT * FROM expenses WHERE id = ?', [result.insertId]);

        res.status(201).json({ success: true, message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ success: false, message: 'Failed to add expense' });
    }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userExpense = await dbHelpers.get('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.userId]);
        if (!userExpense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        await dbHelpers.run('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete expense' });
    }
});

// Get expense statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const totalResult = await dbHelpers.get('SELECT SUM(amount) as total FROM expenses WHERE user_id = ?', [req.user.userId]);
        const categoryResult = await dbHelpers.all('SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category', [req.user.userId]);
        const monthlyResult = await dbHelpers.all(`
            SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total
            FROM expenses
            WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6
        `, [req.user.userId]);

        res.json({
            success: true,
            stats: {
                totalExpenses: totalResult?.total || 0,
                byCategory: categoryResult || [],
                monthlyTrend: monthlyResult.reverse() || []
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

module.exports = router;
