export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum MRStatus {
  VALID = 'Valid',
  INVALID = 'Invalid',
  DECIDE_LATER = 'Decide Later',
}

export interface MetamorphicRelation {
  id: string;
  description: string;
  driver: string;
  status: MRStatus;
  language: string;
}

export interface UploadedCodeFile {
  name: string;
  content: string;
}