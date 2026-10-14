

interface MonthSidebarProps<T extends string> {
  activeTab: T;
  onChange: (tab: T) => void;
  tabs: {
    key: T;
    label: string;
  }[];
}

export function MonthSidebar<T extends string>({
  activeTab,
  onChange,
  tabs,
}: MonthSidebarProps<T>) {
  return (
    <div className="w-52 shrink-0">
      <div className="rounded-xl border bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              w-full
              text-left
              px-4
              py-3
              rounded-lg
              text-sm
              font-medium
              transition-all
              mb-1
              ${
                activeTab === tab.key
                  ? "bg-indigo-700 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}