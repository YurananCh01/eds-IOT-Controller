import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
// import axios from "axios";
import "./TemplateAdmin.css";

const TemplateAdmin: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>("home");
    const navigate = useNavigate();

    useEffect(() => {
        const savedMenu = localStorage.getItem("activeMenu");

        if (savedMenu) setActiveMenu(savedMenu);
    }, []);


    const handleMenuClick = (menu: string) => {
        setActiveMenu(menu);
        localStorage.setItem("activeMenu", menu);
    };

    const handleLogout = () => {
        // localStorage.clear();
        navigate("/login");
    };



    return (
        <div className="dashboard-main">
            <div className="navbar">
                <h3
                    style={{
                        textAlign: "center",
                        marginLeft: "240px",
                        textUnderlineOffset: "6px",
                        textShadow: "1px 1px 1px rgba(0,0,0,0.05)",
                    }}
                >
                    <div style={{ color: "#3a2d4b", fontSize: "34px", fontWeight: 600 }}>
                        EDS IOT
                    </div>
                    <div style={{ color: "#333", fontSize: "24px" }}>CONTROLLER</div>
                </h3>

                <div className="menu-container">
                    <span className="user-name" style={{ color: "#a28448" }}>
                        <i className="bi bi-person-circle" style={{ color: "#a28448" }} />
                        {" "}
                    </span>
                </div>

                <div className="sidebar always-visible">
                    <img
                        src="/img/logo.png" //เปลี่ยนโลโก้
                        alt="Logo"
                        className="logo"
                    />

                    <ul>
                        {/* เพิ่มเมนูด้านล่างนี้ */}
                        <li>
                            <Link
                                className={activeMenu === "home" ? "active" : ""}
                                to={`/templateAdmin`}
                                onClick={() => handleMenuClick("home")}
                            >
                                HOME
                            </Link>
                        </li>
                             <li>
                            <Link
                                className={activeMenu === "map" ? "active" : ""}
                                to={`/map`}
                                onClick={() => handleMenuClick("map")}
                            > 
                                Map
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={activeMenu === "device" ? "active" : ""}
                                to={`/device`}
                                onClick={() => handleMenuClick("device")}
                            >
                                Device
                            </Link>
                        </li>
                             <li>
                            <Link
                                className={activeMenu === "schedule" ? "active" : ""}
                                to={`/schedule`}
                                onClick={() => handleMenuClick("schedule")}
                            > 
                                Schedule
                            </Link>
                        </li>
                   
                    </ul>

                    <div className="logout" style={{ fontSize: "12px" }}>
                        <button onClick={handleLogout}>ออกจากระบบ</button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                <Outlet />
            </div>
        </div>
    );
};

export default TemplateAdmin;
