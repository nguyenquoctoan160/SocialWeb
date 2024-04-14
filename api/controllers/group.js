import * as groupService from "../services/GroupService.js";
import { AuthService } from "../services/AuthService.js";
import { upload } from "../Multer.js";
import path from "path";

export const getGroupById = async (req, res) => {
    try {
        const userId = await AuthService.verifyUserToken(req.cookies.accessToken);

        AuthService.IsAccountBanned(userId, async (err, data) => {
            if (err) {
                return res.status(500).json({ error: "This account is banned" });
            }

            const groupId = req.params.groupId;
            groupService.getGroupById(groupId, (err, data) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json(data);
            });
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

export const getGroups = async (req, res) => {
    try {
        const userId = await AuthService.verifyUserToken(req.cookies.accessToken);

        AuthService.IsAccountBanned(userId, async (err, data) => {
            if (err) {
                return res.status(500).json({ error: "This account is banned" });
            }

            groupService.getGroups(userId, (err, data) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json(data);
            });
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}

export const createGroup = async (req, res) => {
    try {
        const { group_name, privacy_level } = req.body;
        const createdBy = await AuthService.verifyUserToken(req.cookies.accessToken);

        AuthService.IsAccountBanned(createdBy, async (err, data) => {
            if (err) {
                return res.status(500).json({ error: "This account is banned" });
            }

            groupService.createGroup(group_name, privacy_level, createdBy, (err, data) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.status(201).json({ message: 'Group created successfully', group: data });
            });
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const updateGroupAvatarController = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userId = await AuthService.verifyUserToken(req.cookies.accessToken);

        AuthService.IsAccountBanned(userId, async (err, data) => {
            if (err) {
                return res.status(500).json({ error: "This account is banned" });
            }

            upload(req, res, async (err) => {
                if (err) {
                    return res.status(500).json(err);
                }

                if (!req.file) {
                    return res.status(400).json({ message: "No file uploaded." });
                }

                const absolutePath = path.resolve(req.file.path);
                groupService.updateGroupAvatarService(userId, groupId, absolutePath, (err, data) => {
                    if (err) {
                        return res.status(500).json({ message: err });
                    }
                    return res.status(200).json({ message: data });
                });
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating group avatar.", error: error });
    }
};

export const getGroupAvatarController = async (req, res) => {
    try {
        groupService.getGroupAvatar(req.params.groupId, (error, data) => {
            if (error) return res.status(500).json(error);
            try {
                return res.sendFile(data);
            } catch (err) {
                return res.status(500).json(err);
            }
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const searchGroupsController = async (req, res) => {
    try {
        const userId = await AuthService.verifyUserToken(req.cookies.accessToken);
        AuthService.IsAccountBanned(userId, async (err, data) => {
            if (err) {
                return res.status(500).json({ error: "This account is banned" });
            }
            const searchText = req.body.searchText;
            groupService.getGroupsBySearchText(searchText, userId, (err, data) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json(data);
            });
        });
    } catch (error) {
        return res.status(500).json(error);
    }
}