import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { FaRegListAlt, FaEnvelope, FaDollarSign, FaCalendarAlt, FaReceipt, FaClipboardCheck } from 'react-icons/fa';
import moment from "moment";

const Paymentdetails = () => {
    const [payment, setPaymentdetails] = useState({});
    const { id } = useParams();
    const contentRef = useRef(null);

    useEffect(() => {
        fetch(`http://localhost:5000/singlepayment/${id}`)
            .then(res => res.json())
            .then(data => setPaymentdetails(data))
            .catch(error => console.error('Error fetching JSON:', error));
    }, [id]);

    const convertToPdf = () => {
        const content = contentRef.current;

        html2canvas(content, { scale: 3 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.height;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.height;
            }

            pdf.save('payment-details.pdf');
        }).catch((error) => {
            console.error('Error generating PDF:', error);
        });
    };

    const {
        transactionid,
        userEmail,
        userName,
        price,
        quantity,
        PackagesNames,
        InstructorsNames,
        enrolleddate
    } = payment;

    return (
        <div>
            <div className="hero h-60 rounded-lg overflow-hidden relative" style={{ backgroundImage: `url("https://logopond.com/logos/1af777beab7e52f2b4f518d09637e48c.png")` }}>
                <div className="hero-overlay bg-opacity-70 absolute inset-0 bg-black"></div>
                <div className="hero-content relative z-5 text-center text-white"></div>
            </div>

            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10" ref={contentRef}>
                <h2 className="text-3xl font-bold text-center mb-8 text-orange-400">Payment Details</h2>

                {/* Transaction ID */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Transaction ID</h3>
                    <div className="flex items-center gap-2">
                        <FaRegListAlt className="text-blue-500" />
                        <span>{transactionid}</span>
                    </div>
                </div>

                {/* User Email */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">User Email</h3>
                    <div className="flex items-center gap-2">
                        <FaEnvelope className="text-red-500" />
                        <span>{userEmail}</span>
                    </div>
                </div>

                {/* User Name */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">User Name</h3>
                    <div className="flex items-center gap-2">
                        <FaRegListAlt className="text-blue-500" />
                        <span>{userName}</span>
                    </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Total Price</h3>
                    <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-500" />
                        <span>{price} ৳</span>
                    </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Quantity</h3>
                    <div className="flex items-center gap-2">
                        <FaClipboardCheck className="text-purple-500" />
                        <span>{quantity}</span>
                    </div>
                </div>

                {/* Packages Names */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Packages</h3>
                    <div className="flex items-center gap-2">
                        <FaReceipt className="text-yellow-500" />
                        <span>{PackagesNames?.join(', ')}</span>
                    </div>
                </div>

                {/* Instructors Names */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Instructors</h3>
                    <div className="flex items-center gap-2">
                        <FaReceipt className="text-yellow-500" />
                        <span>{InstructorsNames?.join(', ')}</span>
                    </div>
                </div>

                {/* Selected Packages ID */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-700">date:</h3>
                    <div className="flex items-center gap-2">
                        <FaRegListAlt className="text-blue-500" />
                        <span>{moment(enrolleddate).format('MMMM Do YYYY, h:mm a')}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={convertToPdf}
                className="bg-blue-500 text-white px-4 py-2 mt-4 mb-5 mx-auto block rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
                Download as PDF
            </button>
        </div>
    );
};

export default Paymentdetails;
