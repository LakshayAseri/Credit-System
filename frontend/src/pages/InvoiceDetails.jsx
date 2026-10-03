import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvoiceById } from "../services/invoiceServices";
import { getPaymentsByInvoice, createPayment, updatePayment, deletePayment } from "../services/paymentServices";
import { deleteInvoice } from "../services/invoiceServices";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
function InvoiceDetails() {

    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [payments, setPayments] = useState([]);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const navigate = useNavigate();

    const handleEditPayment = (payment) => {
        setEditingPaymentId(payment._id);
        setPaymentAmount(payment.amount);
        setPaymentDate(payment.date.split("T")[0]);
        setPaymentMethod(payment.method);
    }


    useEffect(() => {
        async function loadInvoice() {
            try {
                const data = await getInvoiceById(id);

                setInvoice(data);
                const paymentData = await getPaymentsByInvoice(id);
                setPayments(paymentData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadInvoice();
    }, [id]);

    if (loading) {
        return <p>Loading invoices ....</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    const handleRecordPayment = async () => {
        try {
            const paymentData = {
                invoice: id,
                amount: Number(paymentAmount),
                date: paymentDate,
                method: paymentMethod
            };

            await createPayment(paymentData);
            alert("Payment recorded successfully!");

            setPaymentAmount("");
            setPaymentDate("");
            setPaymentMethod("CASH");

            const updatedInvoice = await getInvoiceById(id);
            setInvoice(updatedInvoice);

            const updatedPayments = await getPaymentsByInvoice(id);
            setPayments(updatedPayments);
        } catch (error) {
            alert(error.message);
        }
    }


    const handleUpdatePayment = async () => {
        try {
            const paymentData = {
                invoice: id,
                amount: Number(paymentAmount),
                date: paymentDate,
                method: paymentMethod
            };

            await updatePayment(editingPaymentId, paymentData);
            alert("payment updated successfully")

            setEditingPaymentId(null);
            setPaymentAmount("");
            setPaymentDate("");
            setPaymentMethod("CASH");

            const updatedInvoice = await getInvoiceById(id);
            setInvoice(updatedInvoice);

            const updatedPayments = await getPaymentsByInvoice(id);
            setPayments(updatedPayments);

        } catch (error) {
            alert(error.message);
        }
    }

    const handleDeletePayment = async (paymentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this payment ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deletePayment(paymentId);

            alert("Payment deleted successfully!");

            const updatedInvoice = await getInvoiceById(id);
            setInvoice(updatedInvoice);

            const updatedPayments = await getPaymentsByInvoice(id);
            setPayments(updatedPayments);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteInvoice = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this invoice ? All payments associated with this invoice will also be deleted"
        );
        if (!confirmed) {
            return;
        }
        try {
            await deleteInvoice(id);

            alert("Invoice deleted successfully");
            navigate("/invoices");
        } catch (error) {
            alert(error.message);
        }
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        const invoiceData = invoice.invoice;
        const customer = invoiceData.customer;

        const totalPaid = Number(invoice.totalPaid) || 0;
        const remainingAmount = Number(invoice.remainingAmount) || 0;

        const formatDate = (date) => {
            if (!date) return "-";

            const parsedDate = new Date(date);
            if (Number.isNaN(parsedDate.getTime())) {
                return "-";
            }
            return parsedDate.toLocaleDateString("en-IN");
        };

        // =========================
        // HEADER
        // =========================

        // Header background
        doc.setFillColor(24, 59, 86);
        doc.rect(0, 0, 210, 42, "F");

        // Shop name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");

        doc.text("Lakshay Sofa Set Center", 20, 18);

        // Shop details
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        doc.text(
            "New Matunda Road, in front of Modi Dairy, Bundi (Raj.)",
            20,
            26
        );

        doc.text(
            "Contact: 7665151403",
            20,
            33
        );

        // INVOICE label
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");

        doc.text("INVOICE", 150, 16);

        // Invoice information
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        doc.text(
            `Invoice No. ${invoiceData.invoiceNumber}`,
            150,
            25
        );

        doc.text(
            `Order Date: ${formatDate(invoiceData.orderDate)}`,
            150,
            33
        );

        // =========================
        // CUSTOMER DETAILS
        // =========================

        doc.setTextColor(36, 59, 83);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");

        doc.text("BILL TO", 20, 57);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
            `Name: ${customer?.name || "Unknown Customer"}`,
            20,
            65
        );

        doc.text(
            `Phone: ${customer?.phone || "-"}`,
            20,
            72
        );

        doc.text(
            `Address: ${customer?.address || "-"}`,
            20,
            79
        );

        // Divider
        doc.setDrawColor(220, 231, 239);
        doc.line(20, 86, 190, 86);


        // =========================
        // ITEMS
        // =========================

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(36, 59, 83);

        doc.text("ITEMS", 20, 100);

        let y = 109;

        // Table dimensions
        const tableLeft = 20;
        const tableRight = 190;
        const tableWidth = tableRight - tableLeft;

        const headerTop = 113;
        const headerHeight = 10;

        // Header background
        doc.setFillColor(243, 248, 252);
        doc.rect(
            tableLeft,
            headerTop,
            tableWidth,
            headerHeight,
            "F"
        );

        // Header border
        doc.setDrawColor(220, 231, 239);
        doc.rect(
            tableLeft,
            headerTop,
            tableWidth,
            headerHeight
        );

        // Header text
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(36, 59, 83);

        doc.text("Product", 24, 120);
        doc.text("Qty", 100, 120);
        doc.text("Unit Price", 125, 120);
        doc.text("Amount", 165, 120);

        // Start item rows
        y = 130;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        invoiceData.items.forEach((item) => {

            // Row separator
            doc.setDrawColor(231, 238, 243);
            doc.line(
                tableLeft,
                y - 5,
                tableRight,
                y - 5
            );

            // Product
            doc.text(
                item.productName || "-",
                24,
                y
            );

            // Quantity
            doc.text(
                String(item.quantity),
                100,
                y
            );

            // Unit price
            doc.text(
                `Rs. ${Number(item.unitPrice).toLocaleString("en-IN")}`,
                125,
                y
            );

            // Amount
            doc.text(
                `Rs. ${Number(item.amount).toLocaleString("en-IN")}`,
                165,
                y
            );

            y += 9;
        });

        // Bottom border
        doc.setDrawColor(220, 231, 239);
        doc.line(
            tableLeft,
            y - 5,
            tableRight,
            y - 5
        );

        // Financial summary
        // =========================
        // FINANCIAL SUMMARY
        // =========================

        y += 12;

        const subtotal =
            Number(invoiceData.finalAmount) +
            Number(invoiceData.discount);

        // Summary box
        const summaryLeft = 115;
        const summaryRight = 190;
        const summaryWidth = summaryRight - summaryLeft;

        const summaryTop = y - 5;

        // Subtotal
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(36, 59, 83);

        doc.text("Subtotal", summaryLeft, y);
        doc.text(
            `Rs. ${subtotal.toLocaleString("en-IN")}`,
            165,
            y
        );

        y += 8;

        // Discount
        doc.text("Discount", summaryLeft, y);

        doc.text(
            `Rs. ${Number(invoiceData.discount).toLocaleString("en-IN")}`,
            165,
            y
        );

        y += 8;

        // Divider before final amount
        doc.setDrawColor(220, 231, 239);

        doc.line(
            summaryLeft,
            y - 4,
            summaryRight,
            y - 4
        );

        y += 4;

        // Final amount
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        doc.text("FINAL AMOUNT", summaryLeft, y);

        doc.text(
            `Rs. ${Number(invoiceData.finalAmount).toLocaleString("en-IN")}`,
            165,
            y
        );

        y += 9;

        // Total paid
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text("Total Paid", summaryLeft, y);

        doc.text(
            `Rs. ${totalPaid.toLocaleString("en-IN")}`,
            165,
            y
        );

        y += 8;

        // Remaining
        doc.setFont("helvetica", "bold");

        doc.text("Remaining", summaryLeft, y);

        doc.text(
            `Rs. ${remainingAmount.toLocaleString("en-IN")}`,
            165,
            y
        );

        // Bottom line
        doc.setDrawColor(220, 231, 239);

        doc.line(
            summaryLeft,
            y + 5,
            summaryRight,
            y + 5
        );

        // =========================
        // DELIVERY & PAYMENT DATES
        // =========================

        y += 18;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(36, 59, 83);

        doc.text("ORDER INFORMATION", 20, y);

        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text(
            `Delivery Date: ${formatDate(invoiceData.deliveryDate)}`,
            20,
            y
        );

        if (invoiceData.dueDate) {
            doc.text(
                `Due Date: ${formatDate(invoiceData.dueDate)}`,
                110,
                y
            );
        }

        y += 12;

        // =========================
        // NOTES
        // =========================

        if (invoiceData.notes) {

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);

            doc.text("NOTES", 20, y);

            y += 7;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);

            // Split long notes so they don't overflow
            const noteLines = doc.splitTextToSize(
                invoiceData.notes,
                170
            );

            doc.text(noteLines, 20, y);

            y += noteLines.length * 5 + 8;
        }

        // =========================
        // FOOTER
        // =========================

        doc.setDrawColor(220, 231, 239);

        doc.line(
            20,
            270,
            190,
            270
        );

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(95, 111, 127);

        doc.text(
            "Thank you for your business!",
            105,
            279,
            {
                align: "center"
            }
        );

        doc.setFontSize(8);

        doc.text(
            "Lakshay Sofa Set Center",
            105,
            285,
            {
                align: "center"
            }
        );

        doc.save(`${invoiceData.invoiceNumber}.pdf`);
    };

    return (
        <div className="invoice-details-page">
            <div className="page-header">
                <div>
                    <h2>Invoice Details</h2>
                    <p>{invoice.invoice.invoiceNumber}</p>
                </div>

                <div className="invoice-page-actions">
                    <button
                        type="button"
                        className="download-invoice-button"
                        onClick={handleDownloadPDF}
                    >
                        Download Invoice
                    </button>

                    <button
                        type="button"
                        className="delete-invoice-button"
                        onClick={handleDeleteInvoice}
                    >
                        Delete Invoice
                    </button>
                </div>
            </div>


            <div className="invoice-details-card">
                <div className="invoice-detail-header">
                    <div>
                        <h3>
                            {invoice.invoice.invoiceNumber}
                        </h3>
                        <p>
                            Customer : {invoice.invoice.customer?.name || "Unknown Customer"};
                        </p>
                    </div>

                    <span className={`status ${invoice.status.toLowerCase()
                        }`}
                    >
                        {invoice.status === "PARTIALLY_PAID"
                            ? "Partially paid"
                            : invoice.status === "CLEARED"
                                ? "Cleared"
                                : "Pending"
                        }
                    </span>
                </div>

                <div className="invoice-date-grid">
                    <div>
                        <span>Order Date</span>
                        <strong>
                            {new Date(
                                invoice.invoice.orderDate
                            ).toLocaleDateString("en-IN")}
                        </strong>
                    </div>

                    <div>
                        <span>Delivery Date</span>
                        <strong>
                            {new Date(
                                invoice.invoice.deliveryDate
                            ).toLocaleDateString("en-IN")}
                        </strong>
                    </div>

                    <div>
                        <span>Due Date</span>
                        <strong>
                            {invoice.invoice.dueDate ?
                                new Date(
                                    invoice.invoice.dueDate
                                ).toLocaleDateString("en-ID")
                                : "Not Applicable"}
                        </strong>
                    </div>
                </div>

                <div className="invoice-items-details">
                    <h3>Items</h3>

                    <div className="details-items-table">
                        <div className="details-item-row details-item-header">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Unit Price</span>
                            <span>Amount</span>
                        </div>

                        {invoice.invoice.items.map((item, index) => (
                            <div className="details-item-row" key={index}>
                                <span>{item.productName}</span>
                                <span>{item.quantity}</span>

                                <span>
                                    {Number(item.unitPrice).toLocaleString("en-IN")}
                                </span>

                                <span>
                                    {Number(item.amount).toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="invoice-financial-summary">
                    <div className="financial-line">
                        <span>Subtotal</span>
                        <strong>
                            {(
                                invoice.invoice.finalAmount +
                                invoice.invoice.discount
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="financial-line">
                        <span>Discount</span>
                        <strong>
                            {Number(
                                invoice.invoice.discount
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="finanacial-line final-financial-line">
                        <span>Final Amount</span>
                        <strong>
                            {Number(
                                invoice.invoice.finalAmount
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>
                </div>

                <div className="payment-summary">
                    <div className="payment-summary-line">
                        <span>Total Paid</span>

                        <strong>
                            {Number(
                                invoice.totalPaid
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="payment-summary-line">
                        <span>Remaining</span>

                        <strong>
                            {Number(
                                invoice.remainingAmount
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <div className="payment-summary-line">
                        <span>Status</span>
                        <strong>
                            {invoice.status === "PARTIALLY_PAID"
                                ? "Partially Paid"
                                : invoice.status === "CLEARED"
                                    ? "Cleared"
                                    : "Pending"
                            }
                        </strong>
                    </div>
                </div>

                <div className="payment-history">
                    <div className="section-header">
                        <h3>Payment History</h3>
                    </div>

                    {payments.length === 0 ? (
                        <p className="empty-message">
                            No payments recorded yet.
                        </p>
                    ) : (
                        <div className="payments-table">
                            <div className="payment-row payment-header">
                                <span>Date</span>
                                <span>Amount</span>
                                <span>Method</span>
                            </div>

                            {payments.map((payment) => (
                                <div className="payment-row"
                                    key={payment._id}
                                >
                                    <span>
                                        {new Date(
                                            payment.date
                                        ).toLocaleDateString("en-in")}
                                    </span>

                                    <span>
                                        {Number(
                                            payment.amount
                                        ).toLocaleString("en-IN")}
                                    </span>

                                    <span>
                                        {payment.method}
                                    </span>

                                    <div className="payment-actions">
                                        <button type="button"
                                            className="edit-payment-button"
                                            onClick={() => handleEditPayment(payment)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-payment-button"
                                            onClick={() => handleDeletePayment(payment._id)}
                                        >
                                            Delete

                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="record-payment-section">
                    <div className="section-header">
                        <h3>
                            {editingPaymentId ? "Edit Payment " : "Record Payment"}

                        </h3>
                    </div>

                    <div className="payment-form">
                        <div className="form-group">
                            <label htmlFor="paymentAmount">
                                Amount
                            </label>
                            <input
                                id="paymentAmount"
                                type="number"
                                min="1"
                                value={paymentAmount}
                                onChange={(e) =>
                                    setPaymentAmount(e.target.value)
                                }
                                placeholder="Enter payment amount"
                            />

                            <div className="form-group">
                                <label htmlFor="paymentDate">
                                    Payment Date
                                </label>

                                <input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) =>
                                        setPaymentDate(e.target.value)
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentMethod">
                                    Payment Method
                                </label>

                                <select id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>

                            <button type="button"
                                className="primary-button"
                                onClick={editingPaymentId ? handleUpdatePayment : handleRecordPayment}
                            >
                                {editingPaymentId ? "Update Payment" : "Record Payment"}
                            </button>

                            {
                                editingPaymentId && (
                                    <button
                                        type="button"
                                        className="cancel-payment-button"
                                        onClick={() => {
                                            setEditingPaymentId(null);
                                            setPaymentAmount("");
                                            setPaymentDate("");
                                            setPaymentMethod("CASH");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default InvoiceDetails;