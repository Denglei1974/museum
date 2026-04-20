"use client";

import { Card, Checkbox, CheckboxGroup, Button, Chip, cn } from "@heroui/react";
import { useState } from "react";

// 定义时间段类型
interface TimeSlot {
  id: string;
  label: string;
  balance: number;
  available: boolean;
}

const VolunteerSignup = () => {
  // 静态演示数据
  const timeSlots: TimeSlot[] = [
    { id: "09:00-10:00", label: "09:00-10:00", balance: 4, available: true },
    { id: "10:00-11:00", label: "10:00-11:00", balance: 0, available: false },
    { id: "11:00-12:00", label: "11:00-12:00", balance: 2, available: true },
    { id: "12:00-13:00", label: "12:00-13:00", balance: 4, available: true },
    { id: "13:00-14:00", label: "13:00-14:00", balance: 1, available: true },
    { id: "14:00-15:00", label: "14:00-15:00", balance: 2, available: true },
    { id: "15:00-16:00", label: "15:00-16:00", balance: 2, available: true },
  ];

  // 使用 state 管理选中的时间段
  const [selectedSlots, setSelectedSlots] = useState<string[]>([
    "11:00-12:00",
    "12:00-13:00",
  ]);

  // 处理 Checkbox 选中变化
  const handleCheckboxChange = (slotId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSlots([...selectedSlots, slotId]);
    } else {
      setSelectedSlots(selectedSlots.filter((id) => id !== slotId));
    }
  };

  // 处理报名按钮点击
  const handleSignup = (): void => {
    if (selectedSlots.length === 0) {
      alert("请至少选择一个时间段");
      return;
    }

    const selectedTimeLabels: string[] = selectedSlots
      .map((slotId: string) => {
        const slot = timeSlots.find((s: TimeSlot) => s.id === slotId);
        return slot ? slot.label : null;
      })
      .filter((item): item is string => item !== null);

    alert(
      `您已选择以下时间段：\n${selectedTimeLabels.join("、")}\n\n共 ${selectedSlots.length} 个时间段`,
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-50/30 to-background pb-28">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-default-100 px-4 py-4">
        <h1 className="text-xl font-bold text-default-900">志愿者报名</h1>
        <p className="text-xs text-default-500 mt-0.5">选择您可服务的时间段</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 岗位信息卡片 */}
        <Card className="border-none shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <span className="text-primary text-base">👥</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-default-500">岗位类型</p>
              <p className="text-sm font-semibold text-default-900">
                社会志愿者
              </p>
            </div>
          </div>
          <div className="my-2 border-b border-default-100" />
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <span className="text-primary text-base">📅</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-default-500">岗位日期</p>
              <p className="text-sm font-semibold text-default-900">
                2025年10月10日
              </p>
            </div>
          </div>
        </Card>

        {/* 时间段选择卡片 */}
        <Card className="border-none shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-primary text-base">⏰</span>
              <h2 className="text-sm font-semibold text-default-900">
                预约服务时间段（冬季）
              </h2>
            </div>
            <Chip size="sm" variant="soft" color="default" className="h-5">
              可多选
            </Chip>
          </div>

          <CheckboxGroup
            value={selectedSlots}
            className="gap-2"
            aria-label="服务时间段选择"
          >
            <div className="space-y-2">
              {timeSlots.map((slot: TimeSlot) => {
                const isSelected = selectedSlots.includes(slot.id);
                const isDisabled = !slot.available;

                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer",
                      // 不可选状态
                      isDisabled && [
                        "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed",
                        "dark:bg-gray-800 dark:border-gray-700",
                      ],
                      // 可选且已选中状态 - 绿色主题
                      !isDisabled &&
                        isSelected && [
                          "bg-green-50 border-green-500 shadow-md",
                          "dark:bg-green-900/30 dark:border-green-400",
                        ],
                      // 可选且未选中状态
                      !isDisabled &&
                        !isSelected && [
                          "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/30",
                          "dark:bg-gray-900 dark:border-gray-700 dark:hover:border-green-600",
                        ],
                    )}
                    onClick={() => {
                      if (!isDisabled) {
                        handleCheckboxChange(slot.id, !isSelected);
                      }
                    }}
                  >
                    <Checkbox
                      value={slot.id}
                      isDisabled={isDisabled}
                      isSelected={isSelected}
                      onChange={(isSelected: boolean) =>
                        handleCheckboxChange(slot.id, isSelected)
                      }
                      aria-label={`选择时间段 ${slot.label}`}
                      className="flex-1"
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isDisabled && "text-gray-400",
                          !isDisabled && isSelected && "text-green-700",
                          !isDisabled && !isSelected && "text-gray-700",
                        )}
                      >
                        {slot.label}
                      </span>
                    </Checkbox>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-gray-400 text-xs">👤</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isDisabled && "text-gray-400",
                          !isDisabled && slot.balance === 0 && "text-red-500",
                          !isDisabled && slot.balance > 0 && "text-gray-600",
                        )}
                      >
                        余额 {slot.balance}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CheckboxGroup>

          {/* 提示信息 - 改为绿色主题 */}
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-green-700 text-xs">
              已选择 {selectedSlots.length} 个时间段
              {selectedSlots.length >= 2 && selectedSlots.length <= 6 && (
                <span className="text-green-600 ml-1">
                  ✓ 数量符合要求（2-6个）
                </span>
              )}
              {selectedSlots.length > 0 &&
                (selectedSlots.length < 2 || selectedSlots.length > 6) && (
                  <span className="text-red-500 ml-1">
                    ⚠ 需要选择2-6个时间段
                  </span>
                )}
            </p>
          </div>
        </Card>

        {/* 注意事项卡片 */}
        <Card className="border-none bg-amber-50/80 shadow-sm p-4">
          <div className="flex gap-2">
            <span className="text-amber-500 text-sm">⚠️</span>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• 志愿者服务需满足至少连续2个时间段，最多不超过6个时间段。</p>
              <p>• 每个时间段最多可报名4名志愿者。</p>
              <p>• 服务时间会根据实际情况，可能适当提前或延后。</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-default-100 shadow-lg z-20">
        <Button
          onPress={handleSignup}
          size="lg"
          fullWidth
          className="font-medium shadow-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          立刻报名
        </Button>
      </div>
    </div>
  );
};

export default VolunteerSignup;
