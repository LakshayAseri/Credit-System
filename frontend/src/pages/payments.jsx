import { useEffect , useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPayments } from "../services/paymentServices";

function Payments (){
    const [payments , setPayments] = useState([]);
    const [loading , setLoading] = useState(true)
    const [error , setError] = useState("");

    const navigate = useNavigate();

    useEffect(() =>{
        async function loadPayments(){
            try{
                const data = await getAllPayments();
                console.log("Payments received : " , data );
                setPayments(data);
            }catch(error){
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        loadPayments();
    } , []);

    if(loading){
        return <p>Loading payments...</p>
    }
    if(error){
        return <p>{error}</p>
    }

    return (
        <div className="payments-page">
            <div className="page-header">
                <div>
                    <h2>Payments</h2>
                    <p>View all payments received from customers.</p>
                </div>
            </div>
            <div className="payments-table">
            <div className="payment-row payment-header">
                <span>Date</span>
                <span>Invoice</span>
                <span>Customer</span>
                <span>Amount</span>
                <span>Method</span>
                <span>Action</span>
            </div>

            {payments.length === 0 ? (
                <p className="empty-message">
                    No payments recorded yet.
                </p>    
            ) : (
                payments.map((payment) => (
                    <div className="payment-row"
                        key={payment._id}
                    >
                        <span>
                            {new Date(payment.date).toLocaleDateString("en-IN")}
                        </span>

                        <span>
                            {payment.invoice?.invoiceNumber || "Unknown"}
                        </span>

                        <span>
                            {payment.invoice?.customer?.name || "Unknown Customer"}
                        </span>

                        <span>
                            {Number(payment.amount).toLocaleString("en-IN")}
                        </span>

                        <span>
                            {payment.method}
                        </span>

                        <div className="payment-actions">
                            <button type="button"
                             className="edit-payment-button"
                             onClick={() => 
                                payment.invoice?._id &&
                                navigate(`/invoices/${payment.invoice._id}`)
                             }
                        >
                            View Invoice
                            </button>
                        </div>
                    </div>
                ))
            )}
            </div>
        </div>
    )
}

export default Payments;