import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    // Validar campos obrigatórios
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Registrar usuário
    const user = await authService.register(username, email, password);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    
    // Verificar se é erro de usuário já existente
    if (error instanceof Error && error.message.includes('já existe')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Validar campos obrigatórios
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome de usuário e senha são obrigatórios'
      });
    }

    // Realizar login
    const { accessToken, refreshToken, user } = await authService.login(username, password);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    
    // Verificar se é erro de credenciais inválidas
    if (error instanceof Error && error.message.includes('Credenciais inválidas')) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token é necessário' });
      return;
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao renovar token';
    res.status(401).json({ success: false, message });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    // Realizar logout
    await authService.logout(userId);

    res.status(200).json({ 
      success: true,
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    // Buscar usuário
    const user = await authService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    next(error);
  }
};