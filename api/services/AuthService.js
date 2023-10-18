import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthModel } from "../models/AuthModel.js";

export const AuthService = {
  async register(username, email, password, name) {
    try {
      const userExists = await AuthModel.checkIfUserExists(username);
      if (userExists) throw new Error("User already exists!");

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      await AuthModel.createUser(username, email, hashedPassword, name);

      return "User has been created.";
    } catch (err) {
      throw err;
    }
  },

  async login(username, password) {
    try {
      const user = await AuthModel.getUserByUsername(username);
      if (!user) throw new Error("User not found!");

      const checkPassword = bcrypt.compareSync(password, user.password);
      if (!checkPassword) throw new Error("Wrong password or username!");

      const token = jwt.sign({ id: user.id }, "secretkey");

      const { password: _, ...others } = user;

      return { token, user: others };
    } catch (err) {
      throw err;
    }
  },
  async verifyUserToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) {
          reject("Token is not valid!");
        } else {
          resolve(userInfo);
        }
      });
    });
  },
};