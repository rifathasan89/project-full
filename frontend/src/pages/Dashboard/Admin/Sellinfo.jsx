import React, { useEffect, useState } from 'react';

import moment from 'moment';
import Pagination from '@mui/material/Pagination';
import { ThemeProvider, createTheme } from '@mui/material';
import { ScaleLoader } from 'react-spinners';
import { Link, useNavigate } from 'react-router-dom';
import useAxiosFetch from '../../../hooks/useAxiosFetch';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useUser } from '../../../hooks/useUser';

const Sellinfo= () => {
    const axiosFetch = useAxiosFetch();
    const axiosSecure = useAxiosSecure();
    const { currentUser } = useUser();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginatedPayments, setPaginatedPayments] = useState([]);
    const totalItem = payments.length;
    const [page, setPage] = useState(1);
    let totalPage = Math.ceil(totalItem / 5);
    let itemsPerPage = 5;

    const handleChange = (event, value) => {
        setPage(value);
    };

    useEffect(() => {
        const lastIndex = page * itemsPerPage;
        const firstIndex = lastIndex - itemsPerPage;
        const currentItems = payments.slice(firstIndex, lastIndex);
        setPaginatedPayments(currentItems);
    }, [page, payments]);

    useEffect(() => {
        axiosFetch.get(`/allpayments`)
            .then(res => {
                setPayments(res.data);
                setLoading(false);
            })
            .catch(err => console.log(err));
    }, [currentUser.email]);

    const theme = createTheme({
        palette: {
            primary: {
                main: '#FF1949', // Set the primary color
            },
            secondary: {
                main: '#FF1949', // Set the secondary color
            },
        },
    });

    // Calculate total paid amount
    const totalPaidAmount = payments.reduce((acc, curr) => acc + curr.price, 0);

    if (loading) {
        return <div className='h-full w-full flex justify-center items-center'>
            <ScaleLoader color="#FF1949" />
        </div>;
    }

    return (
        <div>
            <div className="text-center mt-6 mb-16">
                <p className='text-gray-400'>Hey, <span className='text-secondary font-bold'>{currentUser.name}</span> Welcome...!</p>
                <h1 className='text-4xl font-bold'>Your <span className='text-secondary'>Sell </span>Information</h1>
                <p className='text-gray-500 text-sm my-3'>You can see your selling data here</p>
            </div>

            <div>
                <div className="">
                    <h1 className='font-bold'>Total Payments: {payments.length}</h1>
                    <h1 className='font-bold'>Total Paid: {totalPaidAmount}</h1>
                </div>
                <div className="flex flex-col">
                    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                                <table className="min-w-full text-left text-sm font-light">
                                    <thead className="border-b font-medium dark:border-neutral-500">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">#</th>
                                            <th scope="col" className="px-6 py-4">User Name</th>
                                            <th scope="col" className="px-6 py-4">Email</th>
                                            <th scope="col" className="px-6 py-4">Amount</th>
                                            <th scope="col" className="px-6 py-4">Total Items</th>
                                            <th scope="col" className="px-6 py-4">Time</th>
                                            <th scope="col" className="px-6 py-4">Action</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            paginatedPayments.map((payment, idx) => (
                                                <tr
                                                    key={payment._id}
                                                    className="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{(page - 1) * itemsPerPage + idx + 1}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{payment.userName}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{payment.userEmail}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{payment.price}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{payment.selectedPackagesId.length}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        {moment(payment.enrolleddate).format('MMMM Do YYYY, h:mm a')}
                                                    </td>
                                                    <td>
                                                    
               
                                                    <button onClick={() => navigate(`/dashboard/Paymentdetails/${payment._id}`)} className='px-3 bg-green-500 font-bold py-1 text-white w-full my-3 rounded-lg'>View Details</button>

            
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                                <div className="mt-5">
                                    <ThemeProvider theme={theme}>
                                        <Pagination onChange={handleChange} count={totalPage} color="secondary" />
                                    </ThemeProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sellinfo;
