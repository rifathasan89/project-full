import React from 'react';

const Modal = ({ isOpen, onClose, onSubmit }) => {
    const [message, setMessage] = React.useState('');
    const [packageName, setPackageName] = React.useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({ message, packageName });
        setMessage('');
        setPackageName('');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Send Message</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Package Name</label>
                    <input
                        type="text"
                        className="border p-2 w-full rounded"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        placeholder="Enter package name"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                        className="border p-2 w-full h-32 rounded"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
