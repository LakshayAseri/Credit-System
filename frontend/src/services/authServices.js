import { apiRequest } from "./api";

export async function loginUser(phone, password) {
    return await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
            phone,
            password
        })
    });
}

export async function verifyToken() {
    return await apiRequest("/api/auth/me");
}