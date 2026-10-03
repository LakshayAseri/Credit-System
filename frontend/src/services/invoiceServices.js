import { apiRequest } from "./api";

export async function getInvoices() {
    return await apiRequest("/api/invoices");
}

export async function createInvoice(invoiceData) {
    return await apiRequest("/api/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData)
    });
}

export async function getInvoiceById(invoiceId) {
    return await apiRequest(`/api/invoices/${invoiceId}`);
}

export async function deleteInvoice(invoiceId) {
    return await apiRequest(`/api/invoices/${invoiceId}`, {
        method: "DELETE"
    });
}