export interface LoginParams {
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


// types/auth.ts




export interface PermissionType {
  id: number;
  code: string
  name: string
}

export type UserPermission = {
  id: number
  code: string
  name: string
}

export type UserRole = {
  id: number
  name: string
  permissions: {
    permission: UserPermission
  }[]
}

export type User = {
  id: number
  username: string
  name: string
  email?: string
  isActive: boolean
  createdAt: string
  company_id?: string
  roles: {
    role: UserRole
  }[]
}


//roles

export type Permission = {
  id: number
  code: string
  name: string
}

export type RolePermission = {
  permission: {
    code: string
  }
}

export type Role = {
  id: number
  name: string
  description?: string | null
  permissions: RolePermission[]
}



