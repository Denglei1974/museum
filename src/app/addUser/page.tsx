"use client";

import { Check } from "@gravity-ui/icons";
import { userTypeOptions } from "./userType";
import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  Select,
  ListBox,
} from "@heroui/react";

import {getFormData} from "@/components/utils";

export default  function AddUser() {
  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    const newUser = getFormData(e);
    const res=await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    }); 
    
    if (res.ok) {
      alert("用户添加成功！");
    } else {
      const errorData = await res.json();
      alert(`用户添加失败: ${errorData.message}`);
    }
  };

  return (
    <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
      <TextField
        isRequired
        name="username"
        type="string"
        validate={(value) => {
          if (value.length < 2) {
            return "用户名至少需要2个字符";
          }
          return null;
        }}
      >
        <Label>用户名</Label>
        <Input placeholder="请输入您的姓名" />
        <FieldError />
      </TextField>

      <TextField
        isRequired
        name="id_card"
        type="string"
        validate={(value) => {
          if (value.length !== 18) {
            return "身份证号码必须是18个字符";
          }
          return null;
        }}
      >
        <Label>身份证号码</Label>
        <Input placeholder="请输入您的身份证号码" />
        <FieldError />
      </TextField>

      <Select
        className="w-[256px]"
        placeholder="选择用户类型"
        name="user_type"
        isRequired
      >
        <Label>用户类型</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox items={userTypeOptions}>
            {(item) => (
              <ListBox.Item key={item.id} textValue={item.value}>
                {item.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </ListBox>
        </Select.Popover>
      </Select>

      <TextField
        isRequired
        name="phone"
        type="tel"
        validate={(value) => {
          if (value.length !== 11) {
            return "电话号码必须是11个数字";
          }
          if (!/^\d{11}$/.test(value)) {
            return "请输入一个合法的电话号码";
          }

          return null;
        }}
      >
        <Label>电话号码</Label>
        <Input placeholder="请输入您的电话号码" />
        <FieldError />
      </TextField>

      <TextField
        isRequired
        minLength={6}
        name="password"
        type="password"
        validate={(value) => {
          if (value.length < 6) {
            return "密码至少需要6个字符";
          }

          return null;
        }}
      >
        <Label>密码</Label>
        <Input placeholder="输入您的密码" />
        <Description>
          至少需要6个字符，建议包含字母和数字以增强安全性。
        </Description>
        <FieldError />
      </TextField>

      <div className="flex gap-2">
        <Button type="submit">
          <Check />
          添加用户
        </Button>
        <Button type="reset" variant="secondary">
          重置
        </Button>
      </div>
    </Form>
  );
}
