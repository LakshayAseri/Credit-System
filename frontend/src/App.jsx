import { Routes, Route } from "react-router-dom";

import "./App.css";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Layout from "./components/Layout";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./components/createInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import Payments from "./pages/payments";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>

            {/* Public route */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/customers"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Customers />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/invoices"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Invoices />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/invoices/create"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreateInvoice />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/invoices/:id"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <InvoiceDetails />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/payments"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Payments />
                        </Layout>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default App;