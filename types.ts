
export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export type AccessLevel = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar: string;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  type: 'pdf' | 'text';
  uploadDate: string;
  roleAccess: Role[];
  accessLevel: AccessLevel;
  ownerId: string;
  author: string;
  fileSize: string;
  fileUrl?: string; // URL for blob or data string
}

export interface Document extends DocumentMetadata {
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}
