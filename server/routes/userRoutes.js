const express = require('express');
const router = express.Router();
const { User } = require('../models/index');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword });
        
    const { JWT_SECRET } = require('../config/auth');
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, token });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
             const { JWT_SECRET } = require('../config/auth');
             const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
             res.json({ id: user.id, name: user.name, email: user.email, token });
        } else { res.status(401).json({ message: 'Invalid credentials' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get All Users (For Dropdowns)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;