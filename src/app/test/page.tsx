"use client";
import { Button } from "@heroui/react";

export default function Header() {
  return (
    <>
    <h1>hello </h1>
    <div className="relative min-h-screen">
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-gray-200  z-10...">
        <div className="flex justify-around items-center py-2">
          <Button>首页</Button>
          <Button>首页</Button>
          <Button>首页</Button>
        </div>
      </div>
    </div>
    </>
  );
}
