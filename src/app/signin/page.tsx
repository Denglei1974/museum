"use client";

import { Check } from "@gravity-ui/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  Card,
} from "@heroui/react";

import { getFormData } from "@/components/utils";
import { signIn } from "next-auth/react";

export default function Signin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const user = getFormData(e);

    try {
      const res = await signIn("credentials", {
        phone: user.phone,
        password: user.password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
      } else {
        alert("登录失败，请检查您的电话号码和密码是否正确。");
      }
    } catch (error) {
      console.error("登录出错:", error);
      alert("登录失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-background to-primary-50/30">
      {/* 装饰性背景圆 */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <Card className="w-full max-w-md p-6 shadow-xl border-none bg-background/80 backdrop-blur-sm">
          <Form className="flex flex-col gap-6" onSubmit={onSubmit}>
            {/* Logo 区域 */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative w-20 h-20 mb-4">
                <Image
                  src="/images/signin.png"
                  alt="logo"
                  loading="eager"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                欢迎登录
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                博物馆志愿者服务系统
              </p>
            </div>

            {/* 表单字段 */}
            <div className="space-y-4">
              <TextField
                className="w-full"
                isRequired
                name="phone"
                type="tel"
                validate={(value) => {
                  if (!value) return "请输入电话号码";
                  if (value.length !== 11) {
                    return "电话号码必须是11个数字";
                  }
                  if (!/^\d{11}$/.test(value)) {
                    return "请输入一个合法的电话号码";
                  }
                  return null;
                }}
              >
                <Label className="text-sm font-medium">电话号码</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    📱
                  </span>
                  <Input 
                    placeholder="请输入您的电话号码"
                    className="pl-9"
                  />
                </div>
                <FieldError />
              </TextField>

              <TextField
                isRequired
                name="password"
                type="password"
                validate={(value) => {
                  if (!value) return "请输入密码";
                  if (value.length < 6) {
                    return "密码至少需要6个字符";
                  }
                  return null;
                }}
              >
                <Label className="text-sm font-medium">密码</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    🔒
                  </span>
                  <Input 
                    placeholder="输入您的密码"
                    className="pl-9"
                  />
                </div>
                <Description className="text-xs mt-1">
                  至少需要6个字符，建议包含字母和数字以增强安全性。
                </Description>
                <FieldError />
              </TextField>
            </div>

            {/* 登录按钮 */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isDisabled={isLoading}
                className="font-semibold shadow-lg shadow-primary-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    登录中...
                  </div>
                ) : (
                  <>
                    <Check />
                    登录
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card>

        {/* 版权信息 */}
        <p className="text-xs text-gray-400 text-center mt-6">
          © 2024 博物馆志愿者服务系统
        </p>
      </div>
    </div>
  );
}