"use client"

import { useMemo, useState } from "react"
import BonusArchivePage from "@/app/components/bonus/BonusArchive"
import BonusRulesPage from "@/app/components/bonus/BonusRules"
import GenerateBonusPage from "@/app/components/bonus/GenerateBonus"
import { TabButton } from "@/app/components/TabButton"
import { useAuth } from "@/app/components/UserContext"

type BonusTab = "GENERATE" | "ARCHIVE" | "RULES"
export default function BonusManager() {
  const { hasPermission } = useAuth()

  const allowedTabs = useMemo<BonusTab[]>(() => {
    const tabs: BonusTab[] = ["ARCHIVE"]

    if (hasPermission("BONUS_GENERATE")) {
      tabs.unshift("GENERATE")
    }

    if (hasPermission("BONUS_RULES_MANAGE")) {
      tabs.push("RULES")
    }

    return tabs
  }, [hasPermission])

  const [activeTab, setActiveTab] = useState<BonusTab>(allowedTabs[0])

  const handleTabChange = (tab: BonusTab) => {
    if (!allowedTabs.includes(tab)) return
    setActiveTab(tab)
  }

  if (!allowedTabs.includes(activeTab)) {
    setActiveTab(allowedTabs[0])
    return null
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Bonus Management
        </h1>
        <p className="text-sm text-gray-500">
          Prepare, generate, and archive employee bonuses
        </p>
      </div>

      {/* Main Card */}
      <div className="flex-1 px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">

          {/* Tabs */}
          <div className="border-b px-6 py-4 shrink-0">
            <div className="flex gap-8">
              {hasPermission("BONUS_GENERATE") && (
                <TabButton
                  label="Generate"
                  active={activeTab === "GENERATE"}
                  onClick={() => handleTabChange("GENERATE")}
                />
              )}

              <TabButton
                label="Archive"
                active={activeTab === "ARCHIVE"}
                onClick={() => handleTabChange("ARCHIVE")}
              />

              {hasPermission("BONUS_RULES_MANAGE") && (
                <TabButton
                  label="Configure Bonus Rules"
                  active={activeTab === "RULES"}
                  onClick={() => handleTabChange("RULES")}
                />
              )}
            </div>
          </div>
 
          {/* Content Area — ONLY SCROLL AREA */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              {activeTab === "GENERATE" && <GenerateBonusPage />}
              {activeTab === "ARCHIVE" && <BonusArchivePage />}
              {activeTab === "RULES" && <BonusRulesPage />}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

