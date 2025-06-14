import { Response } from "@/actions/FirebaseUserApi";

export function isSuccess<T>(res:Response<T>): res is { success: true; data: T} {
    return res.success
}