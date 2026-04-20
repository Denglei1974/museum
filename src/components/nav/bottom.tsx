"use client";
import { Button } from "@heroui/react";

export default function BottomNav() {
  return (
    <div className="fixed left-0 right-0  bottom-0 h-30 border-2 bg-white shadow-lg border-gray-200  z-10...">
      <div className="flex justify-around items-center py-2">
        <Button className="h-20 w-20">首页</Button>
        <Button className="h-25 w-25">签到</Button>
        <Button className="h-20 w-20">我的</Button>
      </div>
    </div>
  );
}
