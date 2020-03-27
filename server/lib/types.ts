export interface User {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  createdat: number;
  deleted: boolean;
}

export interface Channel {
  name: string;
  owner: string;
  members: [User];
  messages: [Message];
  deleted: boolean;
}

export interface Message {
  id: number;
  author: string;
  body: string;
  deleted: boolean;
}

export interface AuthPayload {
  token: Promise<string>;
  user: User;
}
