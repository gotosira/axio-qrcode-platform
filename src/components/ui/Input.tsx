"use client";
import { twMerge } from "tailwind-merge";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { left?: React.ReactNode; right?: React.ReactNode };

export function Input({ className, left, right, ...props }: Props) {
  return (
    <label className={twMerge("flex items-center gap-2 border rounded-md px-3 h-10 bg-white dark:bg-zinc-900 focus-within:ring-2", className)}>
      {left}
      <input className="w-full bg-transparent outline-none placeholder:text-gray-400" {...props} />
      {right}
    </label>
  );
}


