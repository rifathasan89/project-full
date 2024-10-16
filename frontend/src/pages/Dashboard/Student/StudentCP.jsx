import React from 'react';
import { useUser } from '../../../hooks/useUser';
import user from '../../../assets/dashboard/user.jpg'
import { Link } from 'react-router-dom';
const StudentCP = () => {
    const { currentUser } = useUser();
    return (
        <div className='h-screen flex justify-center items-center'>
            <div className="">
                <div className="flex justify-center items-center">
                    <img onContextMenu={e => e.preventDefault()} className='h-[400px] w-[800px]' placeholder='blur' src={user} alt="" />
                </div>
                <h1 className='text-4xl capitalize  font-bold'>Hi , <span className='text-secondary italic'>{currentUser.name}</span> welcome to your dashboard</h1>
                <p className='text-center text-base'>Hey Dear , This is a simple dashboard home . </p> 
               
            </div>
        </div>
    );
};

export default StudentCP;