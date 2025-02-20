import { UserRoleType } from "../enums/roles"

export interface LoginResponse {
    accessToken: string
    user: {
        id: string
        email: string
        fullName: string
        role: UserRoleType
    }
}