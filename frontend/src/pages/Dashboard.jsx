import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCustomers } from "../services/customerServices";
import { getInvoices } from "../services/invoiceServices";

function Dashboard() {

    const navigate = useNavigate();

    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [recentInvoices, setRecentInvoices] = useState([]);


        const handleLogout = () => {
        const confirmed = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmed) return;

        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {

        async function loadDashboardData() {

            try {

                const [customers, invoices] = await Promise.all([
                    getCustomers(),
                    getInvoices()
                ]);

                setTotalCustomers(customers.length);
                setTotalInvoices(invoices.length);

                const outstanding = invoices.reduce(
                    (total, invoice) =>
                        total + Number(invoice.remainingAmount || 0),
                    0
                );

                setTotalOutstanding(outstanding);

                setRecentInvoices(
                    invoices.slice(-5).reverse()
                );

            } catch (error) {

                console.error(
                    "Failed to load dashboard data : ",
                    error
                );

            }
        }

        loadDashboardData();

    }, []);

    return (
        
        <div className="dashboard">
            
            <div className="dashboard-header">
                <div>
                    <h2>Welcome</h2>
                    <p>
                        Here's what's happening with your business.
                    </p>
                </div>
                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>


            <div className="summary-grid">

                <div className="summary-card">

                    <p>Total Customer</p>

                    <h3>
                        {totalCustomers}
                    </h3>

                </div>


                <div className="summary-card">

                    <p>Total Invoices</p>

                    <h3>
                        {totalInvoices}
                    </h3>

                </div>


                <div className="summary-card">

                    <p>Total Outstanding</p>

                    <h3>
                        {totalOutstanding.toLocaleString("en-IN")}
                    </h3>

                </div>

            </div>


            <div className="quick-actions">

                <h2>Quick Actions</h2>

                <div className="action-grid">

                    <button
                        type="button"
                        onClick={() => navigate("/customers")}
                    >
                        + Add Customer
                    </button>


                    <button
                        type="button"
                        onClick={() => navigate("/invoices/create")}
                    >
                        + Create Invoice
                    </button>


                    <button
                        type="button"
                        onClick={() => navigate("/invoices")}
                    >
                        + Record Payment
                    </button>

                </div>

            </div>


            <div className="recent-invoices">

                <div className="section-header">

                    <h2>Recent Invoices</h2>

                    <button
                        type="button"
                        onClick={() => navigate("/invoices")}
                    >
                        View All
                    </button>

                </div>


                {recentInvoices.length === 0 ? (

                    <div className="invoice-row">

                        <span>
                            No invoices yet
                        </span>

                    </div>

                ) : (

                    recentInvoices.map((invoice) => (

                        <div
                            className="invoice-row"
                            key={invoice._id}
                            onClick={() =>
                                navigate(`/invoices/${invoice._id}`)
                            }
                        >

                            <span>
                                {invoice.invoiceNumber}
                            </span>


                            <span>
                                {invoice.customer?.name ||
                                    "Unknown Customer"}
                            </span>


                            <span>
                                {new Date(
                                    invoice.orderDate
                                ).toLocaleDateString("en-IN")}
                            </span>


                            <span>
                                ₹
                                {Number(
                                    invoice.finalAmount
                                ).toLocaleString("en-IN")}
                            </span>


                            <span
                                className={`status ${
                                    invoice.status === "PARTIALLY_PAID"
                                        ? "partially"
                                        : invoice.status === "CLEARED"
                                            ? "cleared"
                                            : "pending"
                                }`}
                            >
                                {invoice.status === "PARTIALLY_PAID"
                                    ? "Partially Paid"
                                    : invoice.status === "CLEARED"
                                        ? "Cleared"
                                        : "Pending"}
                            </span>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

export default Dashboard;