type TabButtonProps = {
    label: string
    active: boolean
    onClick: () => void
  }
  
  export function TabButton({ label, active, onClick }: TabButtonProps) {
    return (
      <button
        onClick={onClick}
        className={`
          text-sm font-medium pb-2 transition
          ${
            active
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }
        `}
      >
        {label}
      </button>
    )
  }
  