import React from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom'; // Added useNavigate
import { toast } from 'react-toastify'; 
import Modal from './Modal';
import { useUser } from '../../../hooks/useUser';
import moment from 'moment';

const Viewstudents = () => {
    const data = useLoaderData();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentStudent, setCurrentStudent] = React.useState(null);
    const { currentUser, isLoading } = useUser();
    const students = Array.isArray(data) ? data : (data?.students || []);
    
    const navigate = useNavigate(); // Initialize navigate
    
    if (!students || students.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
                <p className="text-gray-600">No students have enrolled in this package yet.</p>
            </div>
        );
    }

    const handleSendMessageClick = (student) => {
        setCurrentStudent(student);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStudent(null);
    };

    const handleViewTaskClick = (student) => {
        navigate('/dashboard/giventask', { state: { email: student.userEmail } }); // Pass userEmail as state
    };

    const handleSubmitMessage = async ({ message, packageName }) => {
        try {
            const response = await fetch('http://localhost:5000/api/studenttask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: currentStudent.userName,
                    email: currentStudent.userEmail,
                    id: currentStudent._id, 
                    message,
                    packageName, 
                   instructorname: currentUser?.name,
                   instructoremail: currentUser?.email,
                   date: new Date()
                }),
            });
    
            if (response.ok) {
                toast.success('Message sent successfully!');
                handleCloseModal();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Email</th>
                        <th className="py-3 px-6 text-left">Enrolled Date</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {students.map((student, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 text-left whitespace-nowrap">
                                <div className="flex items-center">
                                    <span className="font-medium">{student.userName}</span>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-left">
                                <span>{student.userEmail}</span>
                            </td>
                            <td className="py-3 px-6 text-left">
                                <span>{moment(student.enrolleddate).format('MMMM Do YYYY, h:mm a')}</span>
                            </td>
                            <td className="py-3 px-6 text-center">
                                <button 
                                    className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition"
                                    onClick={() => handleSendMessageClick(student)}
                                >
                                    Send Message
                                </button>
                                <button 
                                    className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 transition ml-2"
                                    onClick={() => handleViewTaskClick(student)}
                                >
                                    View Task
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSubmit={handleSubmitMessage} 
            />
        </div>
    );
};

export default Viewstudents;
