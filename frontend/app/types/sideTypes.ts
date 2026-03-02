import { LucideIcon } from "lucide-react"

export type MenuChild = {
  label: string
  path: string
  icon: LucideIcon
  permission?: string
}

export type MenuItem = {
  label: string
  icon: LucideIcon
  path?: string
  permission?: string
  children?: MenuChild[]
}

export type MenuSection = {
  title: string
  items: MenuItem[]
}
