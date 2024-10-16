import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../../hooks/useUser';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
const KEY = import.meta.env.VITE_IMG_TOKEN;

const Updatemypackage = () => {
    const { id } = useParams();
    const API_URL = `https://api.imgbb.com/1/upload?key=${KEY}`;
    const axiosSecure = useAxiosSecure();
    const { currentUser, isLoading } = useUser();
    const [packageData, setPackageData] = useState(null); // To hold the package data
    const [image, setImage] = useState(null); // To hold the updated image file

    // Fetch the package data by ID
    useEffect(() => {
        axiosSecure.get(`/singlepackage/${id}`)
            .then(res => {
                setPackageData(res.data); // Populate form with data
            })
            .catch(err => {
                console.error('Error fetching package data:', err);
            });
    }, [id, axiosSecure]);
    console.log(packageData);
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedData = Object.fromEntries(formData);

        if (image) {
            // Upload the new image if one is provided
            formData.append('file', image);

            toast.promise(
                fetch(API_URL, {
                    method: 'POST',
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success === true) {
                            updatedData.image = data.data.display_url;
                            sendUpdateRequest(updatedData);
                        }
                    }),
                {
                    pending: 'Updating package...',
                    success: 'Package updated successfully!',
                    error: 'Failed to update package',
                }
            );
        } else {
            // Send update request without changing the image
            sendUpdateRequest(updatedData);
        }
    };

    const sendUpdateRequest = (updatedData) => {
        // Send updated package data to the server
        axiosSecure.put(`/update-package-admin/${id}`, updatedData)
            .then(res => {
                console.log(res.data);
                toast.success('Package updated successfully!');
            })
            .catch(err => {
                console.error('Failed to update package:', err);
                toast.error('Failed to update package.');
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file); // Set the new image file
    };

    if (isLoading || !packageData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="">
            <div className="my-10">
                <h1 className="text-center text-3xl font-bold">Update Your Package</h1>
            </div>

            <form onSubmit={handleFormSubmit} className="mx-auto p-6 bg-white rounded shadow">
                <div className="grid grid-cols-2 w-full gap-3">
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                            Package Name
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-secondary rounded-md focus:outline-none focus:ring-blue-500"
                            type="text"
                            required
                            placeholder="Your Package Name"
                            name="name"
                            defaultValue={packageData?.name || ''}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="image" className="font-bold">Thumbnail Photo</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            name="image"
                            className="block mt-[5px] w-full border border-secondary shadow-sm rounded-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 file:border-0 file:bg-secondary file:text-white file:mr-4 file:py-3 file:px-4"
                        />
                    </div>
                </div>

                <div className="">

                    <div className="grid gap-3 grid-cols-2">
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="instructorName">
                                Instructor Name
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-secondary rounded-md focus:outline-none focus:ring-blue-500"
                                type="text"
                                placeholder="Instructor Name"
                                name="instructorName"
                                defaultValue={packageData?.instructorName || ''}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="instructorEmail">
                                Instructor Email
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-secondary rounded-md focus:outline-none focus:ring-blue-500"
                                type="email"
                                disabled
                                name="instructorEmail"
                                value={packageData?.instructorEmail || currentUser?.email}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="availableSeats">
                            Available Seats
                        </label>
                        <input
                            className="w-full border-secondary px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                            type="number"
                            required
                            placeholder="How many seats are available?"
                            name="availableSeats"
                            defaultValue={packageData?.availableSeats || 0}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="price">
                            Price
                        </label>
                        <input
                            className="w-full border-secondary px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                            type="number"
                            required
                            placeholder="How much does it cost?"
                            name="price"
                            defaultValue={packageData?.price || 0}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="finishedDate">
                            Finished Date
                        </label>
                        <input
                            className="w-full border-secondary px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                            type="date"
                            required
                            name="finishedDate"
                            defaultValue={packageData?.finishedDate || 0}
                        />
                    </div>

                </div>

                

                    <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                        Description About Your Package
                    </label>
                    <textarea
                        className="resize-none border w-full p-2 rounded-lg border-secondary outline-none"
                        rows="4"
                        placeholder="Description about your course"
                        name="description"
                        defaultValue={packageData?.description || ''}
                    ></textarea>
                </div>

                <div className="text-center w-full">
                    <button
                        className="bg-secondary w-full hover:bg-red-400 duration-200 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                    >
                        Update Package
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Updatemypackage;
