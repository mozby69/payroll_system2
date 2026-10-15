"use client";

import { useState } from "react";
import { Users, Building2, Layers, ShieldCheck, File, FileSignature } from "lucide-react";

import AccountConfigurationModal from "../users/modal/AccountConfigurationModal";
import BranchList from "../general/BranchList";
import RoleConfigurationModal from "../users/modal/RoleConfiguration";
import BranchGroupManager from "../branch-groups/BranchGroupManager";
import LocalModePage from "../general/LocalMode";
import SignatoryList from "../allowance/signatoryList";

type TabType = "users" | "branches" | "groups" | "permissions" | "local_data" | "signatories";

export default function SettingsModal() {
  const [activeTab, setActiveTab] = useState<TabType>("users");


  return (
    <div className="flex h-150">

      {/* LEFT SIDEBAR */}
      <div className="w-60 border-r bg-gray-50 p-4 flex flex-col gap-2">

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 p-2 rounded-md ${
            activeTab === "users" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          <Users size={16}/> Users
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 p-2 rounded-md ${
            activeTab === "branches" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          <Building2 size={16}/> Branches
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 p-2 rounded-md ${
            activeTab === "groups" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          <Layers size={16}/> Branch Groups
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 p-2 rounded-md ${
            activeTab === "permissions" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          <ShieldCheck size={16}/> Permissions
        </button>


         <button onClick={() => setActiveTab("local_data")}
          className={`flex items-center gap-2 p-2 rounded-md ${
            activeTab === "local_data" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}>
          <File size={16}/> Local Data
        </button>
        <button onClick={() => setActiveTab("signatories")}
          className={`flex items-center gap-2 p-2 rounded-md ${
            activeTab === "signatories" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}>
          <FileSignature size={16}/> Signatories
        </button>

      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">

        {activeTab === "users" && (
                   <div className="flex flex-col gap-4 h-full">
                 
                   {/* CONTENT */}
                   <div className="flex-1 overflow-y-auto pr-2">
                   <div className="bg-white border rounded-lg p-4 shadow-sm">
                           <AccountConfigurationModal />
                   </div>
                   </div>
   
               </div>
        )}

        {activeTab === "branches" && (
            <div className="flex flex-col gap-4 h-full">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b pb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                    Branch Management
                    </h2>
                    <p className="text-sm text-gray-500">
                    Reorder and assign branches into groups
                    </p>
                </div>

                
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto pr-2">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <BranchList />
                </div>
                </div>

            </div>
         )}

            {activeTab === "groups" && <BranchGroupManager />}

        {activeTab === "permissions" && (
          <div className="flex flex-col gap-4 h-full">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
                Permission Management
            </h2>
            <p className="text-sm text-gray-500">
                Manage user permissions and access control across the system
            </p>
            </div>

          
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto pr-2">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
               <RoleConfigurationModal />
          </div>
          </div>

      </div>
        )}


       {activeTab === "local_data" && (
        <LocalModePage>
          </LocalModePage>
          )}
       {activeTab === "signatories" && (
            <div className="w-full border-t border-slate-200 py-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Signatories Management
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage report signatories, positions, and approval roles
                    across all companies.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <SignatoryList />
              </div>
            </div>
          )}

          
      </div>
    </div>
  );
}