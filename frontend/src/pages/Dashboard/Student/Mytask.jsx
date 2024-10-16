import React, { useEffect, useState } from 'react';
import { useUser } from '../../../hooks/useUser'; // Assuming you have a custom hook for user context
import moment from 'moment'; // Ensure you import moment

const Mytask = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, isLoading } = useUser(); // Get current user details

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                // Make sure the email is available before making the request
                if (!currentUser?.email) {
                    throw new Error('User email is not available');
                }

                const response = await fetch(`http://localhost:5000/api/studenttask?email=${currentUser.email}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText); // Log detailed error response
                }

                const data = await response.json();
                setTasks(data); // Set tasks state with fetched data
            } catch (err) {
                setError(err.message); // Set error message
            } finally {
                setLoading(false); // End loading state
            }
        };

        fetchTasks(); // Fetch tasks when component mounts
    }, [currentUser]); // Dependency on currentUser

    // Handle loading and error states
    if (isLoading) return <div className="text-center">Loading tasks...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
            {tasks.length === 0 ? (
                <p className="text-gray-600">No tasks found for this user.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <div key={task._id} className="bg-white shadow-lg rounded-lg p-4 border border-gray-300">
                            <h3 className="font-bold text-lg">{task.packageName}</h3>
                            <p className="text-gray-700"><strong>Instructor:</strong> {task.instructorname}</p>
                            <div className="text-gray-600 max-h-32 overflow-y-auto break-words">
                                <strong>Message:</strong> {task.message}
                            </div>
                            <p className="text-gray-600"><strong>Instructor Email:</strong> {task.instructoremail}</p>
                            <p className="text-gray-600"><strong>Date:</strong> {task.date ? moment(task.date).format('MMMM Do YYYY') : 'Not Get Data'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Mytask;
