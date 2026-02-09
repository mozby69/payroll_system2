"use client"
import BonusArchivePage from "@/app/components/bonus/BonusArchive"
import BonusRulesPage from "@/app/components/bonus/BonusRules"
import GenerateBonusPage from "@/app/components/bonus/GenerateBonus"
import { TabButton } from "@/app/components/TabButton"
import { useState } from "react"


type BonusTab = "GENERATE" | "ARCHIVE" | "RULES"

export default function BonusManager() {
    const [activeTab, setActiveTab] = useState<BonusTab>("GENERATE")
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Bonus Management
          </h1>
          <p className="text-sm text-gray-500">
            Prepare, generate, and archive employee bonuses
          </p>
        </div>
     
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border h-[calc(100vh-180px)] flex flex-col">

      {/* Tabs */}
      <div className="border-b px-6 py-4">
        <div className="flex gap-8">

          <TabButton
            label="Generate"
            active={activeTab === "GENERATE"}
            onClick={() => setActiveTab("GENERATE")}
          />

          <TabButton
            label="Archive"
            active={activeTab === "ARCHIVE"}
            onClick={() => setActiveTab("ARCHIVE")}
          />

          <TabButton
            label="Configure Bonus Rules"
            active={activeTab === "RULES"}
            onClick={() => setActiveTab("RULES")}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "GENERATE" && <GenerateBonusPage />}
        {activeTab === "ARCHIVE" && (
            <BonusArchivePage />
        )}
        {activeTab === "RULES" && <BonusRulesPage />}
      </div>
    </div>
    </div>
  )
}
