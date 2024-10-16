import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useUser } from '../../../hooks/useUser';
import { Fade, Slide } from "react-awesome-reveal";
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const MyPackages = () => {
    const [Packages, setPackages] = useState([]);
    const { currentUser, isLoading } = useUser();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    useEffect(() => {
        axiosSecure.get(`/Packages/${currentUser?.email}`)
            .then(res => setPackages(res.data))
            .catch(err => console.log(err))
    }, [isLoading])






    const handleFeedback = (id) => {
        const thePackage = Packages.find(pac => pac._id === id);
        if (thePackage.reason) {
            Swal.fire(
                'Reason For Rejected',
                thePackage.reason,
                'info'
            )
        }
        else {
            Swal.fire(
                'Wow Looks Good',
                'Your package is approved',
                'success'
            )
        }
    }

    return (
        <div>
            <div className="my-9">
                <h1 className='text-4xl font-bold text-center '>My <span className='text-secondary'>Package</span></h1>
                <div className="text-center">

                    <Fade duration={100} className='text-[12px]  text-center' cascade>Here you can see all your Packages and information</Fade>
                </div>


                <div className="">
                    {
                        Packages.length === 0 ? <div className='text-center text-2xl font-bold mt-10'>You have not added any Package yet</div> :
                            <div className="mt-9">
                                {
                                    Packages.map((Pac, index) => <Slide duration={1000} key={index} className='mb-5 hover:ring ring-secondary duration-200 focus:ring rounded-lg'>
                                        <div className="bg-white flex  rounded-lg gap-8  shadow p-4">
                                            <div className="">
                                                <img className='max-h-[200px] max-w-[300px]' src={Pac.image} alt="" />
                                            </div>
                                            <div className="w-full">
                                                <h1 className='text-[21px] font-bold text-secondary border-b pb-2 mb-2'>{Pac.name}</h1>
                                                <div className="flex gap-5">
                                                    <div className="">
                                                        <h1 className='font-bold mb-3'>Some Info : </h1>
                                                        <h1 className='text-secondary my-2'><span className='text-black '>Total Student</span> : {Pac.totalEnrolled ? Pac.totalEnrolled : 0}</h1>
                                                        <h1 className='text-secondary'><span className='text-black '>Total Seats</span> : {Pac.availableSeats}</h1>
                                                        <h1 className='text-secondary my-2'><span className='text-black '>Status</span> : <span className={`font-bold ${Pac.status === 'pending' ? 'text-orange-400' : Pac.status === 'checking' ? 'text-yellow-300' : Pac.status === 'approved' ? 'text-green-500' : 'text-red-600'}`}>{Pac.status}</span></h1>
                                                    </div>
                                                    <div className="">
                                                        <h1 className='font-bold mb-3'>.....</h1>
                                                        <h1 className='text-secondary my-2'><span className='text-black '>Price</span> : {Pac.price} <span className='text-black'>$</span></h1>
                                                        <h1 className='text-secondary my-2'><span className='text-black '>Submitted</span> : <span className=''>{Pac.submitted ? moment(Pac.submitted).format('MMMM Do YYYY') : 'Not Get Data'}</span></h1>
                                                    </div>
                                                    <div className="w-1/3">
                                                        <h1 className='font-bold mb-3'>Action : </h1>
                                                        <button onClick={()=>navigate(`/dashboard/view/${Pac._id}`)} className='px-3 bg-green-500 font-bold  py-1 text-white w-full my-3 rounded-lg'>View Students</button>
                                                        <button className='px-3 bg-secondary font-bold  py-1 text-white w-full rounded-lg' onClick={() => navigate(`/dashboard/update/${Pac._id}`)}>Update</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Slide>)}
                            </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default MyPackages;