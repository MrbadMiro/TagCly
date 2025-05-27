import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun ,User} from "lucide-react";
import { assets } from '../assets/assets';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch user info from Redux store
    const { userInfo } = useSelector((state) => state.auth);
    

    // Logout Function
    const handleLogout = () => {
        dispatch(logout()); // Clear user info from Redux
        navigate("/login"); // Navigate to login page
    };

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
                </button>
                <div className="input">
                    <Search
                        size={20}
                        className="text-slate-300"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun size={20} className="dark:hidden" />
                    <Moon size={20} className="hidden dark:block" />
                </button>
                <button className="btn-ghost size-10">
                    <Bell size={20} />
                </button>

                {/* Profile Image and Dropdown */}
                <div className='flex items-center cursor-pointer group relative gap-2'>
                    <img
                        className="w-8 rounded-full"
                        src={
                            userInfo?.image
                                ? `${userInfo.image}?t=${Date.now()}` // Force reload new image
                                : assets.profile_pic
                        }
                        alt="Profile"
                        key={userInfo?.image} // Ensures re-render when image changes
                        onError={(e) => {
                            e.target.src = assets.profile_pic;
                        }}
                    />
                    <img className='w-2.5' src={assets.dropdown_icon} alt='Dropdown' />
                    <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                        <div className='min-w-48 bg-white rounded flex flex-col gap-4 p-4'>
                            <Link to="/users/profile">
                                <p className='hover:text-black cursor-pointer'>
                                    My Profile
                                </p>
                            </Link>
                            <p onClick={handleLogout} className='hover:text-black cursor-pointer'>
                                Logout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};