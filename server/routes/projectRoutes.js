const express = require('express');
const router = express.Router();
const { Project, User } = require('../models/index');
const { ProjectMember } = require('../models/index');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, teamLeaderId } = req.body;
        const project = await Project.create({
            name, description, ownerId: req.user.id, teamLeaderId: teamLeaderId || null
        });
        // add owner as a member
        await ProjectMember.create({ projectId: project.id, userId: req.user.id });
        // optionally add team leader as a member
        if (teamLeaderId) await ProjectMember.findOrCreate({ where: { projectId: project.id, userId: teamLeaderId } });
        res.status(201).json(project);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [{ model: User, as: 'teamLeader', attributes: ['name'] }]
        });
        res.json(projects);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get members for a project
router.get('/:projectId/members', authMiddleware, async (req, res) => {
    try {
        const members = await ProjectMember.findAll({ where: { projectId: req.params.projectId } });
        const userIds = members.map(m => m.userId);
        const users = await User.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'email'] });
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Add a member to a project
router.post('/:projectId/members', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body;
        const pm = await ProjectMember.findOrCreate({ where: { projectId: req.params.projectId, userId } });
        res.status(201).json(pm[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Remove a member
router.delete('/:projectId/members/:userId', authMiddleware, async (req, res) => {
    try {
        await ProjectMember.destroy({ where: { projectId: req.params.projectId, userId: req.params.userId } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;