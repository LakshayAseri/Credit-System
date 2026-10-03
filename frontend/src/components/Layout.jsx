import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";


function Layout({ children }) {

    const [sidebarOpen , setSidebarOpen] = useState(false);
    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen}
            onClose={()=>setSidebarOpen(false)}
            />

            <div className="main-section">
                <Navbar 
                    onMenuClick = {() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;