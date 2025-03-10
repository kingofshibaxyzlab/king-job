import NavigationBar from "@/components/NavBar";
import React, { useState } from "react";
import FindJobTab from "./components/FindJobTab";
import MyJobTab from "./components/MyJobTab";
import UserInfoTab from "./components/UserInfoTab";

const UserInfoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("userInfo");

  // Define tabs
  const tabs = [
    { key: "userInfo", label: "User Info" },
    { key: "myJob", label: "My Jobs" },
    { key: "findJob", label: "Find Work" },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "userInfo":
        return <UserInfoTab />;
      case "myJob":
        return <MyJobTab />;
      case "findJob":
        return <FindJobTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 min-h-screen">
      <NavigationBar />
      <div className="container mx-auto max-w-6xl p-2 md:p-6 mt-10">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar / Tab Menu */}
          <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <div className="sticky top-40 z-20">
              <div className="overflow-x-auto md:overflow-visible whitespace-nowrap">
                <div className="flex flex-row md:flex-col">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-3 rounded-lg mx-1 md:mx-0 md:mb-2 font-semibold transition-colors duration-300 text-center w-full md:w-auto ${
                        activeTab === tab.key
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="w-full md:w-3/4 md:ml-6 flex justify-center">
            <div className="w-full">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
