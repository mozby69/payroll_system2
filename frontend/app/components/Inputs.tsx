"use client";

import { useFormContext } from "react-hook-form";

type FormInputProps = {
  type?: "text" | "date" | "number" | "email" | "password";
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  readOnly?: boolean;
};

export default function FormInput({
  type = "text",
  name,
  id,
  value,
  readOnly = false,
  placeholder,
  className = "",
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error =
    name &&
    name
      .split(".")
      .reduce((acc: any, key) => acc?.[key], errors);

  return (
    <div className="flex flex-col gap-[0.2rem]">
      <input
        type={type}
        id={id ?? name}
        placeholder={placeholder}
        readOnly={readOnly}
        {...(name && !readOnly ? register(name) : {})}
        value={readOnly ? value ?? "" : undefined}
        className={` bg-white w-full px-4 py-2  focus:border-2 focus:border-mainDark focus:outline-none text-mainDark rounded-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]
          ${error ? "border-2 border-negative" : ""}
          ${className}`}
      />

      {error && (
        <span className="text-negative text-[0.7rem]">
          {error.message as string}
        </span>
      )}
    </div>
  );
}
