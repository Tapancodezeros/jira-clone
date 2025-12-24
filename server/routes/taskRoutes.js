const express = require('express');
const router = express.Router();
const { Task, User, Notification, Comment, Activity } = require('../models/index');
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

        // validate assigneeId if provided
        let finalAssignee = null;
        if (assigneeId !== undefined && assigneeId !== null && assigneeId !== '') {
            const idNum = Number(assigneeId);
            if (Number.isNaN(idNum)) return res.status(400).json({ message: 'Invalid assigneeId' });
            const user = await User.findByPk(idNum);
            if (!user) return res.status(400).json({ message: `Assignee with id ${idNum} does not exist` });
            finalAssignee = idNum;
        }

        const task = await Task.create({
            title, description, projectId, assigneeId: finalAssignee, status, priority
        });

        if (finalAssignee) {
            await Notification.create({
                userId: finalAssignee,
                title: 'New Task Assigned',
                message: `You have been assigned to task: ${title}`,
                type: 'info',
                link: `/project/${projectId}`
            });
        }
        res.status(201).json(task);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Update Task (Drag and Drop status change)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            const oldAssignee = task.assigneeId;
            await task.update(req.body);

            if (req.body.assigneeId && Number(req.body.assigneeId) !== oldAssignee) {
                await Notification.create({
                    userId: req.body.assigneeId,
                    title: 'Task Assignment Update',
                    message: `You have been assigned to task: ${task.title}`,
                    type: 'info',
                    link: `/project/${task.projectId}`
                });
            }
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

// --- Comments ---

// Get comments for a task
router.get('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { taskId: req.params.id },
            include: [{ model: User, as: 'author', attributes: ['name', 'id'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Add a comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.create({
            content,
            taskId: req.params.id,
            userId: req.user.id
        });
        // fetch with author
        const fullComment = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'author', attributes: ['name', 'id'] }]
        });

        // Log activity
        await Activity.create({
            taskId: req.params.id,
            userId: req.user.id,
            type: 'comment',
            description: 'added a comment'
        });

        res.status(201).json(fullComment);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- Activities ---

// Get activities for a task
router.get('/:id/activities', authMiddleware, async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { taskId: req.params.id },
            include: [{ model: User, as: 'actor', attributes: ['name', 'id'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(activities);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;