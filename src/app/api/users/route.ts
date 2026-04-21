import dbConnect from "@/lib/db";
import User from "@/lib/models/user";
import { hashPassword } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const { username, id_card, user_type, phone, password } =
      await request.json();
    await dbConnect();

    const existingUser =
      (await User.findOne({ phone })) || (await User.findOne({ id_card }));
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), {
        status: 400,
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      username: username,
      id_card: id_card,
      user_type: user_type,
      phone: phone,
      password: hashedPassword,
    });
    await user.save();

    return new Response(
      JSON.stringify({ message: "User created successfully" }),
      { status: 201 },
    );
  } catch {
    return new Response(JSON.stringify({ message: "Error creating user" }), {
      status: 500,
    });
  }
}
