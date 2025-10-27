import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[#DFF2D4] placeholder:text-[#DFF2D4]/50 selection:bg-[#6BF178] selection:text-[#04101B] bg-[#0a1f33]/50 border-[#6BF178]/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base text-[#DFF2D4] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#6BF178] focus-visible:ring-[#6BF178]/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
