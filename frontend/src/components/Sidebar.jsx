import {Link} from "react-router-dom";

function Sidebar({isOpen , onClose}){
    return (
        <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
            <div className="logo">
                <h2>Credit System</h2>
            </div>

            <nav className="sidebar-nav">
                <Link to="/" onClick = {onClose}>
                    Dashboard
                </Link>

                <Link to="/customers" onClick = {onClose}>
                    Customers
                </Link>

                <Link to="/invoices" onClick = {onClose}>
                    Invoices
                </Link>

                <Link to="/payments" onClick = {onClose}>
                    Payments
                </Link>
                
            </nav>
             
        </aside>
    );
}

export default Sidebar;