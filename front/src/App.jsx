import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Find from "./pages/Find";
import Register from "./pages/Register";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Policy from "./pages/Policy";
import SendEmail from "./pages/password_recovery/SendEmail";
import NewPassword from "./pages/password_recovery/NewPassword";
import EmailConfirm from "./pages/EmailConfirm";
import RecoverSuccess from "./pages/password_recovery/RecoverSuccess";
import ProfileEdit from "./pages/profile/Edit";
import ChangeProfilePicture from "./pages/profile/ChangeProfilePicture";
import Profile from "./pages/profile/Profile";
import ProfileVerify from "./pages/profile/verification/Verification";
import Wallet from "./pages/wallet/Wallet";
const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/find" element={<Find />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/recover" element={<SendEmail />} />
        <Route path="/newPassword" element={<NewPassword />} />
        <Route path="/recover/success" element={<RecoverSuccess />} />
        <Route path="/email_confirm" element={<EmailConfirm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/profile/verify" element={<ProfileVerify />} />
        <Route path="/profile/change-profile-picture" element={<ChangeProfilePicture />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </Router>
  );
};

export default App;
