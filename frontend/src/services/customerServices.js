import { apiRequest } from "./api";

export async function getCustomers() {
    return await apiRequest("/api/customers");
}

export async function createCustomer(customerData) {
    return await apiRequest("/api/customers", {
        method: "POST",
        body: JSON.stringify(customerData)
    });
}

export async function updateCustomer(customerId, customerData) {
    return await apiRequest(`/api/customers/${customerId}`, {
        method: "PUT",
        body: JSON.stringify(customerData)
    });
}

export async function deleteCustomer(customerId) {
    await apiRequest(`/api/customers/${customerId}`, {
        method: "DELETE"
    });

    return true;
}