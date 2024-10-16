import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment'; // Optional for date formatting
import Swal from 'sweetalert2';
import { useUser } from '../../../hooks/useUser';

const Giventask = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation(); 
    const navigate = useNavigate();
    const userEmail = location.state?.email; 
    const { currentUser, isLoading } = useUser();

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                if (!userEmail || !currentUser.email) {
                    throw new Error('Required email parameters are not available');
                }
    
                const response = await fetch(`http://localhost:5000/api/giventask?studentEmail=${userEmail}&instructorEmail=${currentUser.email}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }
    
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchTasks();
    }, [userEmail, currentUser.email]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:5000/api/studenttask/${id}`, {
                    method: 'DELETE'
                })
                .then(res => res.json())
                .then(data => {
                    if (data.deletedCount > 0) {
                        const remaining = tasks.filter(booking => booking._id !== id);
                        setTasks(remaining);
                        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
                    } else {
                        Swal.fire('Error!', 'Item could not be deleted.', 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Error!', 'There was an error deleting the item.', 'error');
                });
            }
        });
    };

    if (loading) return <div className="text-center">Loading tasks...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Tasks for {userEmail}</h2>
            {tasks.length === 0 ? (
                <p className="text-gray-600">No tasks found for this student.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <div key={task._id.$oid} className="bg-white shadow-lg rounded-lg p-4 border border-gray-300">
                            <h3 className="font-bold text-lg">{task.packageName}</h3>
                            <p className="text-gray-700"><strong>Instructor:</strong> {task.instructorname}</p>
                            <div className="text-gray-600 max-h-32 overflow-y-auto break-words">
                                <strong>Message:</strong> {task.message}
                            </div>
                            <p className="text-gray-600"><strong>Name:</strong> {task.name}</p>
                            <p className="text-gray-600"><strong>Email:</strong> {task.email}</p>
                            <p className="text-gray-600"><strong>Date:</strong> {task.date ? moment(task.date).format('MMMM Do YYYY') : 'Not Get Data'}</p>
                            <div className="flex space-x-2 mt-4">
                                <button 
                                    className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition"
                                    onClick={() => handleDelete(task._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Giventask;
