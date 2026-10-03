import { useLocation, useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {

    const location = useLocation();
    const navigate = useNavigate();

    const getPageTitle = () => {

        if (location.pathname === "/") {
            return "Dashboard";
        }

        if (location.pathname === "/customers") {
            return "Customer Management";
        }

        if (location.pathname === "/invoices") {
            return "Invoice Management";
        }

        if (location.pathname === "/invoices/create") {
            return "Create Invoice";
        }

        if (location.pathname.startsWith("/invoices/")) {
            return "New Invoice";
        }

        if (location.pathname === "/payments") {
            return "Payments";
        }

        return "Credit System";
    };

const handleLogout = () => {

    const confirmed = window.confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem("token");

    navigate("/login");
};

    return (
        <header className="navbar">

            <button
                type="button"
                className="menu-button"
                onClick={onMenuClick}
            >
                ☰
            </button>

            <h1>{getPageTitle()}</h1>
        </header>
    );
}

export default Navbar;