import express from "express";
import {
  getUser,
  updateUser,
  getFollowedUsers,
  getUsers,
  findUserByName,
  changePasswordController,
  updateProfilePicController,
  updateCoverPicController,
  getProfilePicController,
  getCoverPicController,
  ChangeGenderController,
  ChangeBirthDateController,
  ChangeWebsiteController,
  ChangeLocationController,
} from "../controllers/user.js";

const router = express.Router();

router.get("/find/:userId", getUser);
router.get("/getUsers", getUsers);
router.put("/", updateUser);
router.put("/profilePic", updateProfilePicController);
router.put("/coverPic", updateCoverPicController);
router.get("/profilePic/:id", getProfilePicController);
router.get("/coverPic/:id", getCoverPicController);
router.get("/followed-users/:userId", getFollowedUsers);
router.get("/searchuser/:name", findUserByName);
router.post("/changepassword", changePasswordController);
router.post("/gender", ChangeGenderController);
router.post("/birthdate", ChangeBirthDateController);
router.post("/contact", ChangeWebsiteController);
router.post("/location", ChangeLocationController);

export default router;
