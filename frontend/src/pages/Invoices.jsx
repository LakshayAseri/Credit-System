import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../services/invoiceServices";

function Invoices() {

    const [invoices, setInvoices] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {

        async function loadInvoices() {

            try {

                const data = await getInvoices();

                setInvoices(data);

            } catch (error) {

                setError("Failed to load invoices");

            } finally {

                setLoading(false);

            }

        }

        loadInvoices();

    }, []);


    const filteredInvoices = invoices.filter((invoice) => {

        const search = searchTerm.toLowerCase();

        const invoiceNumber =
            invoice.invoiceNumber?.toLowerCase() || "";

        const customerName =
            invoice.customer?.name?.toLowerCase() || "";

        return (
            invoiceNumber.includes(search) ||
            customerName.includes(search)
        );

    });


    return (

        <div className="invoices-page">

            <div className="page-header">

                <div>

                    <h2>Invoices</h2>

                    <p>Manage your invoices and payments</p>

                </div>

                <button 
                    className="primary-button"
                    onClick={()=>navigate("/invoices/create")}
                >
                    + Create Invoice
                </button>

            </div>


            <div className="invoice-search">

                <input
                    type="text"
                    placeholder="Search by invoice number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

            </div>


            <div className="invoices-table">

                <div className="invoice-row invoice-header">

                    <span>Invoice</span>

                    <span>Customer</span>

                    <span>Date</span>

                    <span>Amount</span>

                    <span>Status</span>

                </div>


                {loading && (

                    <div className="empty-message">

                        Loading Invoices...

                    </div>

                )}


                {!loading && error && (

                    <div className="empty-message">

                        {error}

                    </div>

                )}


                {!loading &&
                    !error &&
                    filteredInvoices.length === 0 && (

                        <div className="empty-message">

                            {searchTerm
                                ? "No invoices match your search"
                                : "No invoices found"}

                        </div>

                    )}


                {!loading &&
                    !error &&
                    filteredInvoices.map((invoice) => {
                        
                        return (

                            <div
                                className="invoice-row"
                                key={invoice._id}
                                onClick={() => navigate(`/invoices/${invoice._id}`)}
                            >

                                <span>
                                    {invoice.invoiceNumber}
                                </span>


                                <span>

                                    {invoice.customer
                                        ? invoice.customer.name
                                        : "Unknown Customer"}

                                </span>


                                <span>

                                    {new Date(
                                        invoice.orderDate
                                    ).toLocaleDateString("en-IN")}

                                </span>


                                <span>

                                    ₹{Number(
                                        invoice.finalAmount
                                    ).toLocaleString("en-IN")}

                                </span>


                                <span
                                    className={`status ${
                                        invoice.status
                                            ? invoice.status.toLowerCase()
                                            : "pending"
                                    }`}
                                >

                                    {invoice.status === "PARTIALLY_PAID"
                                        ? "Partially Paid"
                                        : invoice.status === "CLEARED"
                                        ? "Cleared"
                                        : "Pending"
                                    }

                                </span>

                            </div>

                        );

                    })}

            </div>

        </div>

    );

}

export default Invoices;