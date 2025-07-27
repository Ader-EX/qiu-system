"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React, { useState } from "react";
import logo from "@/public/logo.png";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useForm } from "react-hook-form";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { router } = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/auth/login`,
        {
          username: data.username,
          password: data.password,
        }
      );

      const { access_token, refresh_token, detail } = response.data;

      if (access_token && refresh_token) {
        toast.dismiss();
        toast.success("Login berhasil!");

        Cookies.set("access_token", access_token);
        Cookies.set("refresh_token", refresh_token);
        router.push("/dashboard");
      } else {
        toast.dismiss();
        toast.error(detail || "Invalid credentials");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Login gagal, silahkan coba lagi nanti";
      toast.error(message);
    }
  };

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Card className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
          <div className="p-6 space-y-2 md:space-y-2 sm:p-8">
            <Image
              src={logo}
              width={44}
              height={44}
              alt="logo"
              className="w-[5rem] "
            />
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Selamat Datang
            </h1>
            <p className="text-black/60">Login untuk mengakses QIU Sistem</p>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  {...register("username", { required: true })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Masukkan Username"
                />
              </div>
              <div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      {...register("password", { required: true })}
                      type={showPassword ? `text` : `password`}
                      placeholder="*******"
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bottom-2 cursor-pointer hover:scale-[105%] focus:text"
                    >
                      {!showPassword ? (
                        <EyeIcon className="size-5" />
                      ) : (
                        <EyeOffIcon className="size-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="flex w-full">
                Masuk
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default LoginPage;
