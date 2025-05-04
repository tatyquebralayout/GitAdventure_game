import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // Changed from bcrypt to bcryptjs
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    // Validar campos obrigatórios
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    // Verificar se usuário já existe
    const userExists = await userRepository.findOne({
      where: [{ username }, { email }]
    });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'Usuário ou e-mail já existe'
      });
      return;
    }

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const user = userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await userRepository.save(user);

    // Retornar resposta sem incluir a senha
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Validar campos obrigatórios
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Nome de usuário e senha são obrigatórios'
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    // Buscar usuário pelo nome de usuário
    const user = await userRepository.findOne({ where: { username } });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Retornar resposta sem incluir a senha
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming logout logic might not need specific user actions server-side beyond clearing client-side token
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    next(error);
  }
};