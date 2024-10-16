import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useUser } from '../../../../hooks/useUser';
import { Pagination, ThemeProvider, createTheme } from '@mui/material';
import { ScaleLoader } from 'react-spinners';
import moment from 'moment';

const EnrolledPackages = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [paginatedData, setPaginatedData] = useState([]); 
    const [loading, setLoading] = useState(true);
    const { currentUser } = useUser();
    const itemPerPage = 2;
    const axiosSecure = useAxiosSecure();
    const theme = createTheme({
        palette: {
            primary: {
                main: '#ff0000', // Set the primary color
            },
            secondary: {
                main: '#00ff00', // Set the secondary color
            },
        },
    });

    useEffect(() => {
        axiosSecure.get(`/myenrolled/${currentUser.email}`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => console.log(err));
    }, [currentUser.email, axiosSecure]);

    // Pagination logic
    useEffect(() => {
        const lastIndex = page * itemPerPage;
        const firstIndex = lastIndex - itemPerPage;
        const currentData = data.slice(firstIndex, lastIndex);
        setPaginatedData(currentData);
    }, [page, data]);

    const handleChange = (event, value) => setPage(value);
    
    const handleDetailsClick = (packageId) => {
        // Implement navigation to details page for the specific packageId
        console.log(`Details clicked for packageId: ${packageId}`);
        // You can use a router to navigate to a detailed view
    };

    if (loading) {
        return <div className='h-full w-full flex justify-center items-center'><ScaleLoader color="#FF1949" /></div>;
    }

    return (
        <div>
            <div className="text-center my-10">
                <h1 className="text-2xl font-bold text-gray-700">Enrolled Packages</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">Package Name</th>
                            <th className="border border-gray-300 px-4 py-2">Instructor Name</th>
                            <th className="border border-gray-300 px-4 py-2">Date</th>

                            <th className="border border-gray-300 px-4 py-2">Quantity and Price</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {
                            paginatedData.flatMap((item) => {
                                return item.PackagesNames.map((packageName, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {packageName}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {item.InstructorsNames[index]}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                        
                                            {moment(item.enrolleddate).format('MMMM Do YYYY, h:mm a')}
                                        </td>
                                        {index === 0 && (
                                            <td className="border border-gray-300 px-4 py-2" rowSpan={item.PackagesNames.length}>
                                                {item.quantity}   ৳ {item.price}
                                            </td>
                                            
                                        )}
                                        
                                    </tr>
                                ));
                            })
                        }
                    </tbody>
                </table>
            </div>

            <ThemeProvider theme={theme}>
                <div className="w-full h-full flex justify-center items-center my-10">
                    <Pagination onChange={handleChange} count={Math.ceil(data.length / itemPerPage)} color="primary" />
                </div>
            </ThemeProvider>
            <div className="">
                <p className='text-center'>Showing result <span className='text-secondary font-bold'>{page} <span className='text-black font-medium'>of</span> {Math.ceil(data.length / itemPerPage)}</span></p>
            </div>
        </div>
    );
};

export default EnrolledPackages;
