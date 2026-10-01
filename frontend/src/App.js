// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";

// import LandingPage from "./pages/LandingPage";
// import UserDashboard from "./pages/UserDashboard";
// import AdminDashboard from "./pages/AdminDashboard";

// import ProtectedRoute from "./routes/ProtectedRoute";
// import AdminRoute from "./routes/AdminRoute";

// import ForgotPassword from "./pages/ForgotPassword";
// import VerifyOTP from "./pages/VerifyOTP";
// import ResetPassword from "./pages/ResetPassword";

// import Events from "./pages/user/Events";
// import MyRegistrations from "./pages/user/MyRegistrations";

// function App() {

//   return (

//     <BrowserRouter>

//       <Routes>

//         {/* ================= AUTH ================= */}

//         <Route
//           path="/login"
//           element={<Login />}
//         />

//         <Route
//           path="/register"
//           element={<Register />}
//         />


//         {/* ================= LANDING ================= */}

//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <LandingPage />
//             </ProtectedRoute>
//           }
//         />


//         {/* ================= USER ================= */}

//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <UserDashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/user/events"
//           element={
//             <ProtectedRoute>
//               <Events />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/user/registrations"
//           element={
//             <ProtectedRoute>
//               <MyRegistrations />
//             </ProtectedRoute>
//           }
//         />

//         {/* ================= ADMIN ================= */}

//         <Route
//           path="/admin"
//           element={
//             <AdminRoute>
//               <AdminDashboard />
//             </AdminRoute>
//           }
//         />


//         {/* ================= PASSWORD ================= */}

//         <Route
//           path="/forgot-password"
//           element={<ForgotPassword />}
//         />

//         <Route
//           path="/verify-otp"
//           element={<VerifyOTP />}
//         />

//         <Route
//           path="/reset-password"
//           element={<ResetPassword />}
//         />

//       </Routes>

//     </BrowserRouter>

//   );
// }


// export default App;

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";

import LandingPage from "./pages/LandingPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

import Events from "./pages/user/Events";
import MyRegistrations from "./pages/user/MyRegistrations";
import MyTasks from "./pages/user/MyTasks";
import Notifications from "./pages/user/Notifications";
import Profile from "./pages/user/Profile";

import UserLayout from "./layouts/UserLayout";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ================= AUTH ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ================= LANDING ================= */}

        <Route
          path="/"
          element={
              <LandingPage />
          }
        />


        {/* ================= USER PANEL ================= */}

        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<UserDashboard />}
          />


          {/* Events */}

          <Route
            path="/user/events"
            element={<Events />}
          />


          {/* My Registrations */}

          <Route
            path="/user/registrations"
            element={<MyRegistrations />}
          />


          {/* Future modules */}

          <Route
            path="/user/tasks"
            element={<MyTasks />}
          />


          <Route
            path="/user/notifications"
            element={<Notifications />}
          />

          <Route 
             path="/user/profile" 
             element={<Profile />} 
          />         
 
        </Route>


        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />


        {/* ================= PASSWORD ================= */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


      </Routes>

    </BrowserRouter>

  );
}


export default App;