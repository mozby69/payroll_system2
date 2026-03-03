"use client"
import React, { forwardRef } from "react"

const TestPrinting = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="print-area3">
      <h1>dwadwad</h1>
    </div>
  )
})

TestPrinting.displayName = "TestPrinting"

export default TestPrinting