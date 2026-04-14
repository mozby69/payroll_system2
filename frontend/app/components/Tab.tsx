import React from "react";

export interface TabItem<T extends string> {
  key: T;
  label: string;
}

interface TabsProps<T extends string> {
  activeTab: T;
  onChange: (tab: T) => void;
  tabs: TabItem<T>[];
}

export function Tabs<T extends string>({
  activeTab,
  onChange,
  tabs,
}: TabsProps<T>) {
return (
  <div className="bg-indigo-900 rounded-xl p-3 flex gap-2 w-full">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all
          ${
            activeTab === tab.key
              ? "bg-white text-indigo-900 shadow"
              : "text-white hover:bg-indigo-800"
          }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
}
