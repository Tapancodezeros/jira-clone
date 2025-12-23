const express = require('express');
const router = express.Router();
const { Task, User } = require('../models/index');
const authMiddleware = require('../middleware/authMiddleware');

// Get tasks for a project
router.get('/:projectId', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { projectId: req.params.projectId },
            include: [{ model: User, as: 'assignee', attributes: ['name'] }]
        });
        res.json(tasks);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Create Task
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, projectId, assigneeId, status, priority } = req.body;
        const task = await Task.create({
            title, description, projectId, assigneeId: assigneeId || null, status, priority
        });
        res.status(201).json(task);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Update Task (Drag and Drop status change)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if(task) {
            await task.update(req.body);
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Delete Task
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            await task.destroy();
            return res.json({ success: true });
        }
        res.status(404).json({ message: 'Task not found' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Restore a soft-deleted task
router.post('/:id/restore', authMiddleware, async (req, res) => {
    try {
        // restore by id
        await Task.restore({ where: { id: req.params.id } });
        const task = await Task.findByPk(req.params.id);
        if (task) return res.json(task);
        res.status(404).json({ message: 'Task not found after restore' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;