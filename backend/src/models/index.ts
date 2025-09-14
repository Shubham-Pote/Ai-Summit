// models/index.ts
export { default as Character } from './character';
export { default as Message } from './message';
export { default as Conversation } from './conversation';
export { default as CharacterRelationship } from './characterRelationship';
export { default as AudioFile } from './audioFile';

// Re-export interfaces for type checking
export type { ICharacter } from './character';
export type { IMessage } from './message';
export type { IConversation } from './conversation';
export type { ICharacterRelationship } from './characterRelationship';
export type { IAudioFile } from './audioFile';
