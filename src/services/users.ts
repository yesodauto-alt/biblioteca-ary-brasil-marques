import pb from '@/lib/pocketbase/client'

export type UserRole = 'administrador' | 'voluntário'
export type UserStatus = 'ativo' | 'inativo'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  created: string
  updated: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  password?: string
}

export const getUsers = async (): Promise<User[]> => {
  return await pb.collection('users').getFullList<User>({ sort: 'name' })
}

export const createUser = async (data: CreateUserData): Promise<User> => {
  return await pb.collection('users').create<User>({
    name: data.name,
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    role: data.role,
    status: 'ativo',
    verified: true,
  })
}

export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.role !== undefined) updateData.role = data.role
  if (data.status !== undefined) updateData.status = data.status
  if (data.password) {
    updateData.password = data.password
    updateData.passwordConfirm = data.password
  }
  return await pb.collection('users').update<User>(id, updateData)
}

export const deleteUser = async (id: string): Promise<void> => {
  await pb.collection('users').delete(id)
}
