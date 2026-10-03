import { apiRequest } from "./api";

export async function getPaymentsByInvoice(invoiceId) {
    return await apiRequest(`/api/payments/invoice/${invoiceId}`);
}

export async function createPayment(paymentData) {
    return await apiRequest("/api/payments", {
        method: "POST",
        body: JSON.stringify(paymentData)
    });
}

export async function updatePayment(paymentId, paymentData) {
    return await apiRequest(`/api/payments/${paymentId}`, {
        method: "PUT",
        body: JSON.stringify(paymentData)
    });
}

export async function deletePayment(paymentId) {
    return await apiRequest(`/api/payments/${paymentId}`, {
        method: "DELETE"
    });
}

export async function getAllPayments() {
    return await apiRequest("/api/payments");
}