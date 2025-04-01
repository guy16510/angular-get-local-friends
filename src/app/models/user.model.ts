export interface User {
  id: string;
  identityId: string;
  userName: string;
  age: number;
  gender: string;
  hasKids: boolean;
  distance: number;
  imageUrl?: string;
  online: boolean;
  lastOnlineAt: string;
} 