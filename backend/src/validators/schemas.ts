import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
  }),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  })
};

export const progressSchemas = {
  saveProgress: Joi.object({
    saveSlot: Joi.number().required().min(1).max(10),
    saveName: Joi.string().required().max(50),
    gameState: Joi.object().required()
  }),

  loadProgress: Joi.object({
    saveSlot: Joi.number().required().min(1).max(10)
  })
};

export const commandSchemas = {
  validateCommand: Joi.object({
    command: Joi.string().required(),
    questId: Joi.string().uuid().required(),
    currentStep: Joi.number().optional()
  })
};

export const questSchemas = {
  startQuest: Joi.object({
    questId: Joi.string().uuid().required(),
    worldId: Joi.string().uuid().required()
  }),
  
  completeStep: Joi.object({
    questId: Joi.string().uuid().required(),
    stepId: Joi.string().uuid().required(),
    command: Joi.string().required()
  })
};