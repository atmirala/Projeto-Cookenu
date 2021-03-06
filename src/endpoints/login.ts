import { Request, Response } from "express";
import { HashManager } from "../services/HashManager";
import { UserDatabase } from "../data/UserDatabase";
import { Authenticator } from "../services/Authenticator";
import { BaseDatabase } from "../data/BaseDatabase";

export const login = async (req: Request, res: Response) => {
  try {
    const email = req.body.email as string;
    const password = req.body.password;

    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserByEmail(email);

    const hashManager = new HashManager();
    const isPasswordCorrect = await hashManager.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Usuário ou senha incorreto");
    }

    const authenticator = new Authenticator();
    const token = authenticator.generateToken({ id: user.id });

    res.status(200).send({
      message: "Usuário logado",
      token,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  } finally {
    await BaseDatabase.destroyConnection();
  }
};
