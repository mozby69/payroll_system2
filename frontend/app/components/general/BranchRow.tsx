"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export default function BranchRow({ branch }: any) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: branch.branchCode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: 6,
    marginBottom: 6,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 10
  }

  return (
    <div className="" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>☰</span>
        {branch.branchCode}
    </div>
  )
}