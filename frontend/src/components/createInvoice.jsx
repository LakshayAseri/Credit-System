import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../services/customerServices";
import { createInvoice } from "../services/invoiceServices";
function CreateInvoice() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customer: "",
        orderDate: "",
        deliveryDate: "",
        dueDate: "",
    });

    const [items, setItems] = useState([
        {
            productName: "",
            quantity: 1,
            unitPrice: ""
        }
    ])
    const [discount, setDiscount] = useState("");
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [error, setError] = useState("");
    const [notes, setNotes] = useState("");
    useEffect(() => {
        async function loadingCustomers() {
            try {
                const data = await getCustomers();
                setCustomers(data);
            } catch (error) {
                setError("Failed to load customers");
            } finally {
                setLoadingCustomers(false);
            }
        }
        loadingCustomers();
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        setItems((previousItems) =>
            previousItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value
                    }
                    : item
            )
        )
    }

    const handleAddItem = () => {
        setItems((previousItems) => [
            ...previousItems,
            {
                productName: "",
                quantity: 1,
                unitPrice: ""
            }
        ])
    };

    const handleRemoveItem = (index) => {
        setItems((previousItems) =>
            previousItems.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    };

    const handleCreateInvoice = async ()=>{
        try{
            const invoiceData = {
                invoiceNumber : `INV-${Date.now()}`,
                customer : formData.customer , 
                orderDate : formData.orderDate , 
                deliveryDate : formData.deliveryDate,
                dueDate : formData.dueDate,

                items : items.map((item) => ({
                    productName : item.productName ,
                     quantity : Number(item.quantity) , 
                     unitPrice : Number(item.unitPrice)
                })),

                discount : Number(discount) || 0, 
                notes
            };

            const createdInvoice = await createInvoice(invoiceData);
            console.log("invoice created : " , createdInvoice);
            alert("invoice created successfully");
            navigate("/invoices");
        }catch(error){
            alert(error.message);
        };
    }

    const subtotal = items.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;

        return total + quantity * unitPrice;
    }, 0);

    const finalAmount = Math.max(subtotal - (Number(discount) || 0), 0);

    return (
        <div className="create-invoice-page">
            <div className="page-header">
                <div>
                    <h2>Create Invoice</h2>
                    <p>Create a new invoice for a customer</p>
                </div>
            </div>

            <div className="invoice-for-card">
                <h3>Invoice Details</h3>

                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}

                {/* Customers */}

                <div className="form-group">
                    <label htmlFor="customer">
                        Customer
                    </label>

                    <select
                        id="customer"
                        name="customer"
                        value={formData.customer}
                        onChange={handleChange}
                        disabled={loadingCustomers}
                    >
                        <option value="">
                            {loadingCustomers
                                ? "loading customers..."
                                : "Select a customer"
                            }
                        </option>

                        {customers.map((customer) => (
                            <option key={customer._id}
                                value={customer._id}
                            >
                                {customer.name} - {customer.phone}
                            </option>
                        ))}

                    </select>
                    {/* Dates */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="orderDate">
                                Order Date
                            </label>

                            <input
                                id="orderDate"
                                type="date"
                                name="orderDate"
                                value={formData.orderDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">

                            <label htmlFor="deliveryDate">
                                Delivery Date
                            </label>

                            <input
                                id="deliveryDate"
                                type="date"
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">
                            <label htmlFor="dueDate">
                                Due Date (optional)
                            </label>

                            <input
                                id="dueDate"
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="invoice-items-section">
                <div className="section-header">
                    <h3>Invoice Items</h3>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={handleAddItem}
                    >
                        + Add Item

                    </button>
                </div>

                <div className="invoice-items-table">
                    <div className="invoice-item-row invoice-item-header">
                        <span>Product</span>
                        <span>Quantity</span>
                        <span>Unit Price</span>
                        <span>Amount</span>
                        <span></span>
                    </div>

                    {items.map((item, index) => {
                        const amount =
                            (Number(item.quantity) || 0) *
                            (Number(item.unitPrice) || 0)
                        return (
                            <div className="invoice-item-row"
                                key={index}>

                                <input type="text"
                                    placeholder="Product name"
                                    value={item.productName}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "productName",
                                            e.target.value
                                        )
                                    }
                                />

                                <input type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "quantity",
                                            e.target.value
                                        )
                                    }
                                />

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                        handleItemChange(
                                            index,
                                            "unitPrice",
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="item-amount">
                                    {amount.toLocaleString("en-IN")}
                                </span>

                                <button
                                    type="button"
                                    className="remove-item-button"
                                    onClick={() =>
                                        handleRemoveItem(index)
                                    }
                                    disabled={items.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })}
                    <div className="invoice-summary">

                        <div className="summary-line">
                            <span>Subtotal</span>

                            <strong>
                                ₹{subtotal.toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <div className="summary-line discount-line">

                            <label htmlFor="discount">
                                Discount
                            </label>

                            <input
                                id="discount"
                                type="number"
                                min="0"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                placeholder="0"
                            />

                        </div>

                        <div className="summary-line final-line">

                            <span>Final Amount</span>

                            <strong>
                                ₹{finalAmount.toLocaleString("en-IN")}
                            </strong>

                        </div>

                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Notes / Remarks</label>

                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes or remarks..."
                            rows="4"
                        />
                    </div>

                    <div className="invoice-form-actions">
                        <button type="button" className="primary-button"
                            onClick={handleCreateInvoice}
                        >
                            Create Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default CreateInvoice;