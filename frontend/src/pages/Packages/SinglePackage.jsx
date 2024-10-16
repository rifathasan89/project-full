import { BiTime } from "react-icons/bi";
import {   FaUser } from "react-icons/fa";
import { useLoaderData } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useState } from "react";
import useAxiosFetch from "../../hooks/useAxiosFetch";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FaTag, FaCalendarAlt } from 'react-icons/fa';  // Icons for Instructor, Package Price, Last Update


const SinglePackage = () => {
    const course = useLoaderData();
    console.log(course);
    const { currentUser } = useUser();
    const role = currentUser?.role;
    const [enrolledPackages, setEnrolledPackages] = useState([]);
    const axiosFetch = useAxiosFetch();
    const axiosSecure = useAxiosSecure();

    // console.log(course)

  
  return (
    <>
      <div
        className=" font-gilroy font-medium text-gray dark:text-white text-lg leading-[27px] w-[90%] mx-auto"
        data-new-gr-c-s-check-loaded="14.1157.0"
        data-gr-ext-installed=""
      >
        {/* breadcrumb or header */}
        <div className="breadcrumbs bg-primary py-8 mt-20 section-padding bg-cover bg-center bg-no-repeat">
          <div className="container text-center">
            <h1 className="text-4xl font-bold">About Package </h1>
          </div>
        </div>
        
        <div className="nav-tab-wrapper tabs section-padding mt-8">
  <div className="container">
    <div className="grid grid-cols-12 md:gap-[30px]">
      <div className="col-span-12">
        <div className="single-course-details" style={{ marginLeft: '50px' }}>
          <div className="xl:h-[470px] h-[350px] mb-10 course-main-thumb">
            <img
              src={course.image}
              alt=""
              className="rounded-md object-fit w-full h-full block"
            />
          </div>

          <h2 className="text-2xl">{course.description}</h2>
          <br />
          <div className="widget custom-text space-y-5">
            {/* Package Price Section with Icon */}
            <h3 className="text-2xl text-purple-700 flex items-center space-x-3">
              <FaTag className="text-yellow-500" /> {/* Icon for Package Price */}
              <span>Package Price: ৳{course.price}</span>
            </h3>

            <ul className="list">
              {/* Instructor Section */}
              <li className="flex space-x-3 border-b border-[#ECECEC] mb-4 pb-4 last:pb-0 last:mb-0 last:border-0">
                <div className="flex-1 space-x-3 flex items-center">
                  <FaUser className="inline-flex text-blue-600" /> {/* Icon for Instructor */}
                  <div className="text-black font-semibold">Instructor</div>
                </div>
                <div className="flex-none" style={{ color: '#8B0000' }}>
                  {course.instructorName}
                </div>
              </li>

              {/* Last Update Section with Icon */}
              <li className="flex space-x-3 border-b border-[#ECECEC] mb-4 pb-4 last:pb-0 last:mb-0 last:border-0">
                <div className="flex-1 space-x-3 flex items-center">
                  <FaCalendarAlt className="text-red-600" /> {/* Icon for Last Update */}
                  <div className="text-black font-semibold">Last Update</div>
                </div>
                <div className="flex-none" style={{ color: '#FF6347' }}>
                  {new Date(course.submitted).toLocaleDateString()}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

       
          </div>
        
      
    </>
  );
};

export default SinglePackage;
