// utils/validation.js
import mongoose from 'mongoose';

export const validateActivityRequest = (req, res, next) => {
    const { petId } = req.params;
    const { days, resolution } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID format' });
    }
    
    if (days && (isNaN(days) || days < 1 || days > 365)) {
      return res.status(400).json({ error: 'Days must be between 1-365' });
    }
    
    if (resolution && !['hourly', 'daily', 'weekly'].includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution type' });
    }
    
    next();
};


export const validateAllPetsActivityRequest = (req, res, next) => {
  const { days, resolution } = req.query;
  
  // Validate days parameter if provided
  if (days && (isNaN(days) || days < 1 || days > 365)) {
    return res.status(400).json({ 
      success: false,
      error: 'Days must be between 1-365' 
    });
  }
  
  // Validate resolution parameter if provided
  if (resolution && !['hourly', 'daily', 'weekly'].includes(resolution)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid resolution type' 
    });
  }
  
  next();
};



export const validateSleepRequest = (req, res, next) => {
    const { petId } = req.params;
    const { days } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID format' });
    }
    
    if (days && (isNaN(days) || days < 1 || days > 30)) {
      return res.status(400).json({ error: 'Days must be between 1-30' });
    }
    
    next();
};

export const validateHealthScoreRequest = (req, res, next) => {
    const { petId } = req.params;
    const { days } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: 'Invalid pet ID format' });
    }
    
    if (days && (isNaN(days) || days < 1 || days > 30)) {
      return res.status(400).json({ error: 'Days must be between 1-30' });
    }
    
    next();
};

// Named exports
export default {
    validateActivityRequest,
    validateSleepRequest,
    validateHealthScoreRequest,
    validateAllPetsActivityRequest
};