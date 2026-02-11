import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserService, getPermissionServices, getRoleServices, getUsersService, loginService, updateRolePermissionsService, updateUserService } from "../services/login";
import { LoginParams, Permission, Role, User } from "../types/login";
import { RegisterSchema, UpdateUserSchema } from "../schema/login.schema";


export const useLogin = () => {
  return useMutation({
    mutationFn: (params: LoginParams) => loginService(params),
    
  });
};


export const useGetRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: getRoleServices,
    staleTime: 1000 * 60 * 5
  })
}

export const useGetPermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ["user-permissions"],
    queryFn: getPermissionServices,
    staleTime: 1000 * 60 * 5
  })
}


export function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsersService,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}


export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterSchema) =>
        createUserService(payload),
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["users"]
          })
        }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserSchema}) =>
      updateUserService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })
}



export const useUpdateRolePermissions = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds
    }: {
      roleId: number
      permissionIds: number[]
    }) =>
      updateRolePermissionsService(roleId, permissionIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
    }
  })
}





