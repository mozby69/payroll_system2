export interface LoginDTO {
  username: string;
  password: string;
}


export interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: string;
  };
}
