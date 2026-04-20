"use client";
import { Button } from "@heroui/react";
import { redirect } from "next/navigation";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>欢迎来到自愿者管理系统的仪表盘！在这里，您可以报名。</p>

      <Button
        className="h-20 w-20"
        onClick={() => {
          redirect("/volunteerSignup");
        }}
      >
        报名
      </Button>
    </div>
  );
}
