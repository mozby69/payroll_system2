"use client"

import {
  MenuIcon,
  XIcon,
  ChevronDown
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MENU_SECTIONS } from "./menu.config"
import { useAuth } from "./UserContext"
import { useRef, useState, useEffect } from "react"

const menuItemClass =
  "flex items-center text-sm gap-x-2 py-2 rounded-md w-full " +
  "hover:bg-mainLight hover:text-mainDark transition-colors cursor-pointer"

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { hasPermission } = useAuth()

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [showArrow, setShowArrow] = useState(false)

  // ✅ Expandable state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const checkScroll = () => {
      const isScrollable = el.scrollHeight > el.clientHeight
      const isAtBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 5

      setShowArrow(isScrollable && !isAtBottom)
    }

    checkScroll()

    el.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)

    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  return (
    <div
      className={`
        h-full w-full bg-mainBg flex flex-col 
        gap-y-8 transition-all duration-300 ${isOpen ? "p-4" : "py-4 px-2"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-mainNeutral pb-3.5">
        {isOpen && (
          <Image
            src="/images/JgcLogoMain.svg"
            alt="JameroGroupOfCompanies"
            width={150}
            height={50}
            priority
          />
        )}

        <button
          onClick={onToggle}
          className={`text-mainLight cursor-pointer ${isOpen ? "" : "mx-auto"}`}
        >
          {isOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Menu */}
      <div
        ref={scrollRef}
        className="relative flex flex-col gap-y-4 items-start w-full overflow-y-auto scrollbar-hide"
      >
        {MENU_SECTIONS.map(section => {
          const visibleItems = section.items.filter(
            item => !item.permission || hasPermission(item.permission)
          )

          if (visibleItems.length === 0) return null

          return (
            <div key={section.title} className="w-full">
              {isOpen && (
                <h6 className="text-sm text-mainNeutral mb-1 py-2">
                  {section.title}
                </h6>
              )}

              <ul className="flex flex-col gap-y-2 w-full text-mainLight font-semibold">
                {visibleItems.map((item) => {
                  const { label, icon: Icon, path, children } = item
                  const isExpandable = Array.isArray(children) && children.length > 0
                  const isExpanded = expanded[label]
                  const isActive = path && pathname === path

                  if (isExpandable) {
                    const isChildActive = children.some(
                      (child) => child.path === pathname
                    )

                    return (
                      <li key={label} className="w-full">
                        <button
                          onClick={() =>
                            setExpanded(prev => ({
                              ...prev,
                              [label]: !prev[label]
                            }))
                          }
                          className={`
                            ${menuItemClass}
                            ${isOpen ? "px-3 justify-between" : "justify-center"}
                            ${isChildActive ? "bg-mainLight text-mainDark" : ""}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="text-mainhighlight shrink-0 w-5" />
                            {isOpen && <span>{label}</span>}
                          </div>

                          {isOpen && (
                            <ChevronDown
                              className={`w-4 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        {isExpanded && isOpen && (
                          <ul className="ml-6 mt-2 flex flex-col gap-2">
                            {children.map((child) => {
                              const ChildIcon = child.icon
                              const isChildActive = pathname === child.path

                              return (
                                <li key={child.label}>
                                  <Link
                                    href={child.path}
                                    className={`
                                      ${menuItemClass}
                                      px-3
                                      ${isChildActive ? "bg-mainLight text-mainDark" : ""}
                                    `}
                                  >
                                    <ChildIcon className="w-4 shrink-0" />
                                    <span>{child.label}</span>
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </li>
                    )
                  }

                  return (
                    <li key={label}>
                      {path && (
                        <Link
                          href={path}
                          className={`
                            ${menuItemClass}
                            ${isOpen ? "px-3" : "justify-center"}
                            ${isActive ? "bg-mainLight text-mainDark" : ""}
                          `}
                        >
                          <Icon className="text-mainhighlight shrink-0 w-5" />
                          {isOpen && <span>{label}</span>}
                        </Link>
                      )}
                    </li>
                  )

                })}
              </ul>
            </div>
          )
        })}
      </div>

    
      {showArrow && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none animate-pulse-soft bg-mainNeutral w-full py-1 inline-flex justify-center opacity-20">
          <div className="flex flex-col items-center gap-0 animate-bounce-soft">
            <ChevronDown className="w-6 h-3 opacity-60" />
            <ChevronDown className="w-6 h-4 opacity-100" />
          </div>
        </div>
      )}
    </div>
  )
}
