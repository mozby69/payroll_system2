"use client";
import { AxiosError } from "axios";

import Image from "next/image";
import Link from "next/link";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import FormInput from "../components/Inputs";
import { useLogin } from "../hooks/login";
import { loginSchema, LoginSchema } from "../schema/login.schema";

import { useRouter } from "next/navigation";
import { LoginParams } from "../types/login";
import { useAuth } from "../components/UserContext";



export default function Login() {
    const router = useRouter();
    const { mutateAsync } = useLogin();
    const { setUser } = useAuth();

    const { mutate, isPending, error } = useLogin();


    const methods = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues:{
            username: "",
            password: "",
        }
    });


    const onSubmit = async (data: LoginParams) => {
    const res = await mutateAsync(data);
    setUser(res.user);
    router.replace("/");
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="relative min-h-screen bg-mainBg text-mainLight w-full flex flex-col items-center justify-center gap-16 pb-14 pt-14 overflow-hidden">
                
                <div className="w-[95%] lg:w-[90%] flex flex-col-reverse gap-y-12 lg:flex-row z-50 px-12">

                    <div className="flex flex-col gap-8 w-full lg:w-[55%]">

                        <h1 className="font-bold text-lg">
                            JAMERO GROUP OF COMPANIES
                        </h1>

                        <div className="flex flex-col gap-12">

                            <h1 className="text-heading font-bold text-5xl max-w-2xl">
                            <span className="text-mainhighlight">Payroll</span> Processing <br />
                            & Reporting <span className="text-mainhighlight">System</span>
                            </h1>

                            <Image
                            src="/images/PayrollPoint.svg"
                            alt="PayrollPoint"
                            width={40}
                            height={40}
                            priority
                            className="w-[24rem] md:md lg:w-lg h-auto"
                            />

                        </div>

                    </div>

                    <div className="w-full lg:w-[45%] flex items-center justify-center">

                        <div className="bg-mainNeutral h-auto w-full rounded-sm shadow-[-20px_-13px_5px_4px_rgba(23,37,100,1)]
                            flex flex-col gap-y-14 p-10 items-start text-mainDark
                        ">
                            <div className="flex flex-col gap-y-1">
                                <h1 className="text-3xl font-bold">WELCOME BACK</h1>
                                <p className="text-sm font-medium">Please login to access the site.</p>
                            </div>

                            <div className="w-full flex flex-col gap-y-6">

                                <div className="w-full flex flex-col gap-y-6">
                                    <FormInput
                                        name="username"
                                        placeholder="Username"
                                    />

                                    <FormInput
                                        name="password"
                                        type="password"
                                        placeholder="*******"
                                    />

                                    {error && (
                                    <p className="text-negative text-sm text-center">
                                        {(error as AxiosError<{ message: string }>)?.response?.data?.message}
                                    </p>
                                    )}


                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="bg-mainhighlight w-full py-2 rounded-md text-lg text-mainLight font-bold disabled:opacity-50"
                                    >
                                        {isPending ? "Signing in..." : "Sign In"}
                                    </button>
                                </div>

                            </div>
                            <Link href="#" className="font-medium">
                            Forgot Password
                            </Link>
                        </div>

                    </div>

                </div>

                <div className=" absolute -bottom-8 left-0">
                    <Image
                        src="/images/JgcShadow.svg"
                        alt="JgcShadow"
                        width={40}
                        height={40}
                        priority
                        className="w-lg md:w-lg lg:w-230 h-auto"
                    />
                </div>

            </form>
            
        </FormProvider>
    );
}
