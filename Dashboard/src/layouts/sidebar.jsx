import React, { forwardRef, useState } from "react"; // Import forwardRef from React
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { navbarLinks } from "@/constants";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";
import logoLight from "@/assets/logo-light.svg"; // Import logoLight
import logoDark from "@/assets/logo-dark.svg"; // Import logoDark

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const [openDropdowns, setOpenDropdowns] = useState({});
    const { userInfo } = useSelector((state) => state.auth); // Access user info from Redux
    const userRole = userInfo?.role; // Get the user's role

    const toggleDropdown = (label) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    // Filter navbarLinks based on the user's role
    const filteredNavbarLinks = navbarLinks.map((navbarLink) => ({
        ...navbarLink,
        links: navbarLink.links.filter((link) => link.roles.includes(userRole)),
    }));

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms_cubic-bezier(0.4,_0,_0.2,_1),_background-color_150ms_cubic-bezier(0.4,_0,_0.2,_1),_border_150ms_cubic-bezier(0.4,_0,_0.2,_1)] dark:border-slate-700 dark:bg-slate-900",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0"
            )}
        >
            <div className="flex gap-x-3 p-3">
                <img src={logoLight} alt="Logoipsum" className="dark:hidden" />
                <img src={logoDark} alt="Logoipsum" className="hidden dark:block" />
                {!collapsed && <p className="text-lg font-medium text-slate-900 transition-colors dark:text-slate-50">TagCly</p>}
            </div>
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {filteredNavbarLinks.map((navbarLink) => (
                    <nav key={navbarLink.title} className={cn("sidebar-group", collapsed && "md:items-center")}>
                        <p className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}>{navbarLink.title}</p>
                        {navbarLink.links.map((link) => (
                            <div key={link.label}>
                                <NavLink
                                    to={link.path}
                                    className={cn("sidebar-item", collapsed && "md:w-[45px]")}
                                    onClick={() => link.subcategories && toggleDropdown(link.label)}
                                    aria-expanded={!!openDropdowns[link.label]}
                                    aria-controls={`dropdown-${link.label}`}
                                >
                                    <link.icon size={22} className="flex-shrink-0" />
                                    {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                                    {link.subcategories && !collapsed && (
                                        <ChevronDown
                                            size={18}
                                            className={`ml-auto transition-transform ${openDropdowns[link.label] ? "rotate-180" : "rotate-0"}`}
                                        />
                                    )}
                                </NavLink>

                                {/* Subcategories Dropdown */}
                                {link.subcategories && openDropdowns[link.label] && !collapsed && (
                                    <div id={`dropdown-${link.label}`} className="ml-6 mt-2 space-y-1">
                                        {link.subcategories
                                            .filter((sub) => sub.roles.includes(userRole)) // Filter subcategories by role
                                            .map((sub) => (
                                                <NavLink
                                                    key={sub.label}
                                                    to={sub.path}
                                                    className="block pl-4 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                >
                                                    {sub.label}
                                                </NavLink>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                ))}
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};