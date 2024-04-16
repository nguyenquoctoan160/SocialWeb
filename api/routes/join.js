import express from "express";
import * as joinController from "../controllers/join.js";

const router = express.Router();

router.post('/join', joinController.createJoin);
router.delete('/', joinController.deleteJoin);
router.put('/join/approve', joinController.approveJoinRequest);
router.delete('/join/reject', joinController.rejectJoinRequest);
router.get('/groups/:groupId/join-requests', joinController.getJoinRequestsByGroupId);
router.get('/groups/:groupId/users', joinController.getUsersByGroup);

export default router;