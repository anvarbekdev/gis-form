import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  titledesc?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, title, titledesc, icon, ...props }, ref) => {
    return (
      <div className="flex relative items-center  rounded-md border border-input xl:w-1/2 sm:w-full">
        <input
          type={type}
          className={cn(
            "h-10 w-full font-thin px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-thin placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {title && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="right-3 absolute cursor-pointer">{icon}</span>
              </TooltipTrigger>
              <TooltipContent className=" bg-[#3c4041]">
                <h1 className=" text-md">{title}</h1>
                <p className=" max-w-50 text-[13px]">{titledesc}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
