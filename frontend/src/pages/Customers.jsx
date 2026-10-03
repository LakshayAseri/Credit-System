import { useEffect, useState , useRef} from "react";
import { getCustomers, createCustomer, updateCustomer , deleteCustomer} from "../services/customerServices";

function Customers() {

    const formRef = useRef(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: ""
    });
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadCustomers() {
            try {
                const data = await getCustomers();
                console.log("Customers received from backend:", data);
                setCustomers(data);
            } catch (error) {
                setError("Failed to load customers");
            } finally {
                setLoading(false);
            }
        }
        loadCustomers();
    }, [])

    const handleEditAddCustomer = (customer) => {
        setEditingCustomer(customer);

        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address
        });

        setShowForm(true);

        setTimeout(()=>{
            formRef.current?.scrollIntoView({
                behavior : "smooth",
                block:"start"
            });
        },0);
    };
const handleAddCustomer = async (e) => {
    e.preventDefault();

    try {

        if (editingCustomer) {

            const updatedCustomer = await updateCustomer(
                editingCustomer._id,
                formData
            );

            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    customer._id === updatedCustomer._id
                        ? updatedCustomer
                        : customer
                )
            );

        } else {

            const newCustomer = await createCustomer(formData);

            setCustomers((prevCustomers) => [
                ...prevCustomers,
                newCustomer
            ]);
        }

        setFormData({
            name: "",
            phone: "",
            address: ""
        });

        setEditingCustomer(null);
        setShowForm(false);

    } catch (error) {
        alert(error.message);
    }
};

const handleDeleteCustomer = async (customer) => {
    const confirmed = window.confirm(
        `Are you sure you want to delete ${customer.name}?`
    );

    if(!confirmed){
        return;
    }

    try{
        await deleteCustomer(customer._id);

        setCustomers((prevCustomers) => 
            prevCustomers.filter(
                (item) => item._id !== customer._id
            )    
        );
    } catch(error){
        alert(error.message);
    }
};


    const filteredCustomers = customers.filter((customer) => {
        const search = searchTerm.toLowerCase();
        return (
            customer.name.toLowerCase().includes(search) ||
            customer.phone.includes(search)
        )
    })
    return (
        <div className="customers-page">

            <div className="page-header">
                <div>
                    <h2>Customers</h2>
                    <p>Manage your customers and their details.</p>
                </div>

                <button className="primary-button"
                    onClick={() => {
                        setEditingCustomer(null);
                        setFormData({
                            name : "" ,
                            phone : "",
                            address : "" 
                        });
                        setShowForm(true)
                    }}
                >
                    + Add Customer
                </button>
            </div>

            {showForm && (
                <form 
                ref={formRef}
                className="customer-form"
                    onSubmit={handleAddCustomer}
                >
                    <div className="form-header">
                        <h3>Add Customer</h3>

                        <button
                            className="forn-close"
                            onClick={() => {
                                setEditingCustomer(null);

                                setFormData({
                                    name:"",
                                    phone:"",
                                    address:""
                                })
                                
                                setShowForm(false)}
                            }
                        >
                            x

                        </button>
                    </div>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value
                                    })
                                }
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value
                                    })
                                }
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value
                                    })
                                }
                                placeholder="Enter address"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setEditingCustomer(null);
                                    setFormData({
                                        name : "",
                                        phone : "",
                                        address : ""
                                    });
                                    setShowForm(false)}
                                }
                            >
                                Cancel
                            </button>

                            <button type="submit"
                                className="primary-button">
                                Save Customer
                            </button>

                        </div>

                    </div>
                </form>



            )}

            <div className="customer-search">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="customers-table">

                <div className="customer-row customer-header">
                    <span>Name</span>
                    <span>Phone</span>
                    <span>Address</span>
                    <span>Actions</span>
                </div>

                {loading && (
                    <div className="customer-row">
                        <span>Loading Customers...</span>
                    </div>
                )}

                {error && (
                    <div className="customer-row">
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && filteredCustomers.map((customer) => (
                    <div className="customer-row" key={customer._id}>

                        <span>{customer.name}</span>
                        <span>{customer.phone}</span>
                        <span>{customer.address}</span>

                        <span>
                            <button
                                onClick={() => handleEditAddCustomer(customer)}>
                                Edit
                            </button>


                            <button onClick={() => handleDeleteCustomer(customer)}>
                                Delete
                            </button>
                        </span>
                    </div>

                ))}
            </div>

        </div>
    );
}

export default Customers;