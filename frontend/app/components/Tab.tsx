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
    <div className="flex border-b border-slate-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-6 py-3 text-sm font-semibold transition
            ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
