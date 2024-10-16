import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import './Payment.css';
import { useUser } from '../../../../hooks/useUser';

const Payment = () => {
    const location = useLocation();
    const { currentUser } = useUser();
    const price = location.state?.price;
    const selectedPackages = location.state?.packages;
    const [succeeded, setSucceeded] = useState(''); // Added state to handle payment success or failure messages

    // Ensure price is available, else navigate back
    if (!price) {
        return <Navigate to="/dashboard/my-selected" replace />;
    }

    console.log(selectedPackages);

    // Function to handle SSL payment
    const handleSslPayment = async () => {
        if (price > 0) {
            try {
                // Create payment
                const paymentResponse = await fetch("http://localhost:5000/create-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userEmail: currentUser?.email,
                        userName: currentUser?.name,
                        price,
                        quantity: selectedPackages.length,
                        selectedPackagesId: selectedPackages.map(item => item._id),
                        PackagesId: selectedPackages.map(item => item.PackageId),
                        PackagesNames: selectedPackages.map(item => item.name),
                        images: selectedPackages.map(item => item.image),
                        InstructorsNames: selectedPackages.map(item => item.instructorName),
                        orderstatus:"Payment not done",
                        enrolleddate: new Date(),
                    }),
                });

                const paymentData = await paymentResponse.json();
                const redirectURL = paymentData.paymentUrl;
                window.location.replace(redirectURL);
            } catch (error) {
                console.error('Payment error:', error);
                setSucceeded('Payment Failed');
            }
        }
    };

    return (
        <div className="flex flex-col items-center p-5 border border-blue-200 rounded-lg hover:shadow-lg">
            <img
                src="https://sslcommerz.com/wp-content/uploads/2021/11/logo.png"
                alt="SSLCommerz Logo"
                className="h-16 mb-4"
            />
            <button
                className="btn btn-primary mt-5 w-full"
                onClick={handleSslPayment}
            >
                Pay with SSLCommerz
            </button>
            <p className="mt-4 text-sm text-gray-500">
                Powered by SSLCommerz
            </p>
            {succeeded && (
                <p className={`mt-4 text-sm ${succeeded.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                    {succeeded}
                </p>
            )}
        </div>
    );
};

export default Payment;
