import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastContainer, toast } from 'react-toastify';
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";



//User
import User from "./pages/Admin/Users/User";
import AddUsers from "./pages/Admin/Users/AddUsers";
import AllUsers from "./pages/Admin/Users/AllUsers";
import Profile from "./pages/Admin/Users/Profile";


//collar
import AddCollar from "./pages/Admin/Collar/AddCollar";
import Collars from "./pages/Admin/Collar/Collars";
import AllCollars from "./pages/Admin/Collar/AllCollars";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute"; // Using an alias// Import the ProtectedRoute component
import Login from "./pages/Auth/Login";

//order
import Oders from "./pages/Admin/Oders/oders";
import CreateOder from "./pages/Admin/Oders/CreateOder";
import AllOders from "./pages/Admin/Oders/AllOders";
import Pet from "./pages/Admin/Pet/Pet";
import AddPet from "./pages/Admin/Pet/AddPet";
import AllPet from "./pages/Admin/Pet/AllPet";
import Ml from "./pages/Admin/Ml/Ml";

import AllActivity from "./pages/Admin/Ml/AllActivity";
import SpecificActivity from "./pages/Admin/Ml/SpecificActivity";


//ml



function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            // element: <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]} />, // Wrap the layout with ProtectedRoute
            children: [
                {
                    element: <Layout />, // Layout for authenticated routes
                    children: [
                        {
                            index: true,
                            element: <DashboardPage />,
                        },
                        {
                            path: "analytics",
                            element: <h1 className="title">Analytics</h1>,
                        },
                        {
                            path: "reports",
                            element: <h1 className="title">Reports</h1>,
                        },
                        {
                            path: "users",
                            element: <User />,
                        },
                        {
                            path: "users/add-user",
                            element: <AddUsers />,
                        },
                        {
                            path: "users/all-users",
                            element: <AllUsers />,
                        },
                        {
                            path: "users/profile",
                            element: <Profile />,
                        },
                        {
                            path: "/login",
                            element: <Login />, // Login page is publicly accessible
                        },
                        {
                            path: "collars",
                            element: <Collars/>,
                        },
                        {
                            path: "collars/add-collar",
                            element: <AddCollar/>,
                        },
                        {
                            path: "collars/all-collars",
                            element: <AllCollars/>,
                        },
                        {
                            path: "oders",
                            element: <Oders/>,
                        },
                        {
                            path: "oders/create-oders",
                            element: <CreateOder/>,
                        },
                        {
                            path: "oders/all-oders",
                            element: <AllOders/>,
                        },
                        {
                            path: "pets",
                            element: <Pet/>,
                        },
                        {
                            path: "pets/create-pet",
                            element: <AddPet/>,
                        },
                        {
                            path: "pets/all-pet",
                            element: <AllPet/>,
                        },
                        {
                            path: "ml",
                            element: <Ml/>,
                        },
                        {
                            path: "ml/activity/:petId",
                            element: <AllActivity/>,
                        },
                        {
                            path: "activity/:petId",
                            element: <SpecificActivity/>,
                        },
                        


                        {
                            path: "student/add-students",
                            element: <h1 className="title">Add Students</h1>,
                        },
                        {
                            path: "inventory",
                            element: <h1 className="title">Inventory</h1>,
                        },
                        {
                            path: "settings",
                            element: <h1 className="title">Settings</h1>,
                        },
                    ],
                },
            ],
        },
        // {
        //     path: "/forgot-password",
        //     element: <ForgotPassword />, // Login page is publicly accessible
        // },
       
        {
            path: "collars",
            element: <AddCollar/>,
        },

        // {
        //     path: "/reset-password",
        //     element: <ResetPassword />, // Login page is publicly accessible
        // },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
            <ToastContainer />
        </ThemeProvider>
    );
}

export default App;