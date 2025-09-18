import { ICharacterPersonality } from "../models/characterPersonality";

export const mariaPersonality: ICharacterPersonality["personality"] = {
  warmth: 9, 
  enthusiasm: 8, 
  directness: 7, 
  playfulness: 8, 
  patience: 7, 
  culturalPride: 9
};

export const akiraPersonality: ICharacterPersonality["personality"] = {
  warmth: 6, 
  enthusiasm: 6,     // Add required field
  directness: 5,     // Add required field  
  playfulness: 4,    // Add required field
  patience: 9, 
  culturalPride: 8,  // Add required field
  formality: 8,      // Optional field
  respect: 9,        // Optional field
  precision: 8,      // Optional field
  wisdom: 7          // Optional field
};
