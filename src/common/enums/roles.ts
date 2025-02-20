export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]
export const UserRoleValues = Object.values(UserRole)
