export type User = {
    id: string;
    username: string;
    password: string;
    createdAt: Date;
  }
  
  export type UserWhereUniqueInput = {
    username: string;
  }
  
  export type UserCreateInput = {
    username: string;
    password: string;
  }
  
  export type SafeUser = Omit<User, 'password'>;
  
  export type AuthResponse = {
    error?: string;
    message?: string;
    user?: SafeUser;
    status?: number;
  }