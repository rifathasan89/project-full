import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Register from "../pages/user/Register";
import Login from "../pages/user/Login";
import Instructors from "../pages/Instructors/Instructors";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import ManageUsers from "../pages/Dashboard/Admin/users/ManageUsers";
import UpdateUser from "../pages/Dashboard/Admin/users/UpdateUser";
import Packages from "../pages/Packages/Packages";
import ErrorPage from "../pages/error/ErrorPage";
//import AddPackages from "../pages/Dashboard/Instructors/AddPackage"; 
// import AddPackages from "../pages/Dashboard/Instructors/AddPackage";
import MyPackages from "../pages/Dashboard/Instructors/MyPackages";
import InstructorCP from "../pages/Dashboard/Instructors/InstructorCP";
import AdminHome from "../pages/Dashboard/Admin/AdminHome";
import ManagePackages from "../pages/Dashboard/Admin/ManagePackages";
import StudentCP from "../pages/Dashboard/Student/StudentCP";
import SelectedClass from "../pages/Dashboard/Student/SelectedPackage";
import Payment from "../pages/Dashboard/Student/Payment/Payment";
import MyPaymentHistory from "../pages/Dashboard/Student/Payment/History/MyPaymentHistory";

import AdminRoute from "./Privet/AdminRoute";
import InstructorRoute from "./Privet/InstructorRoute";
import StudentRoute from "./Privet/StudentRoute";
import PrivetRoute from "./Privet/PrivetRoute";
import EnrolledPackege from "../pages/Dashboard/Student/Enroll/EnrolledPackages";
//import UpdatePackage from "../pages/Dashboard/Instructors/UpdatePackage";
import UpdatePackage from "../pages/Dashboard/Instructors/UpdatePackage"
import SinglePackage from "../pages/Packages/SinglePackage";
import AddPackage from "../pages/Dashboard/Admin/AddPackage";
import Viewstudents from "../pages/Dashboard/Instructors/Viewstudents";
import Mytask from "../pages/Dashboard/Student/Mytask";
import Giventask from "../pages/Dashboard/Instructors/Giventask";
import Paymentdetails from "../pages/Paymentdetails/Paymentdetails";
import Sellinfo from "../pages/Dashboard/Admin/Sellinfo";
import Updatemypackage from "../pages/Dashboard/Admin/Updatemypackage";



export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "instructors",
                element: <Instructors />
            },
            {
                path: "packages",
                element: <Packages />
            },
            
            {
                path: "/Packages/:id",
                element: <SinglePackage/>,
                loader: ({ params }) => fetch(`http://localhost:5000/Package/${params.id}`),
            }
        ]
    },
    {
        path: '/dashboard',
        element: <DashboardLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <PrivetRoute><Dashboard /></PrivetRoute>
            },
            // * ADMIN ROUTES
            {
                path: 'manage-users',
                element: <AdminRoute><ManageUsers /></AdminRoute>
            },
            {
                path: 'update-user/:id',
                element: <AdminRoute><UpdateUser /></AdminRoute>,
                loader: ({ params }) => fetch(`http://localhost:5000/users/${params.id}`),
            },
            {
                path: 'admin-home',
                element: <AdminRoute><AdminHome /></AdminRoute>
            },
            {
                path: 'manage-Package',
                element: <AdminRoute><ManagePackages /></AdminRoute>
            },
            {
                path: 'saleinfo',
                element: <AdminRoute><Sellinfo></Sellinfo></AdminRoute>
            },
            {
                path: 'updatepackageadmin/:id',
                element: <AdminRoute><Updatemypackage></Updatemypackage></AdminRoute>
            },
            // * INSTRUCTOR ROUTES
            {
                path: 'instructor-cp',
                element: <InstructorRoute><InstructorCP /></InstructorRoute>
            },
            
            {
                path: 'add-Package',
                element: <AdminRoute><AddPackage></AddPackage></AdminRoute>
            },
            
            {
                path: 'my-Packages',
                element: <InstructorRoute><MyPackages /></InstructorRoute>
            },
            {
                path: 'giventask',
                element: <InstructorRoute><Giventask></Giventask></InstructorRoute>
            },
            {
                path: 'update/:id',
                element: <InstructorRoute><UpdatePackage /></InstructorRoute>,
                loader: ({ params }) => fetch(`http://localhost:5000/Package/${params.id}`),
            },
            {
                path: 'view/:id',
                element: <InstructorRoute><Viewstudents></Viewstudents></InstructorRoute>,
                loader: ({ params }) => fetch(`http://localhost:5000/get-enrolled-students/${params.id}`),
            },

            // * STUDENT ROUTES
            {
                path: 'student-cp',
                element: <StudentRoute><StudentCP /></StudentRoute>
            },
            {
                path: 'my-selected',
                element: <StudentRoute><SelectedClass /></StudentRoute>
            },
            {
                path: 'user/payment',
                element: <StudentRoute><Payment /></StudentRoute>
            },
            {
                path: 'my-payments',
                element: <StudentRoute><MyPaymentHistory /></StudentRoute>
            },
            {
                path: 'Paymentdetails/:id',
                element: <Paymentdetails />
            }
            ,            
            {
                path: 'my-task',
                element: <StudentRoute><Mytask></Mytask></StudentRoute>
            },
            {
                path: 'enrolled-Packages',
                element: <StudentRoute><EnrolledPackege /></StudentRoute>
            }
        ]
    }
])