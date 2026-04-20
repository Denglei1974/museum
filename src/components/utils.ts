import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const getFormData = (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data: Record<string, string> = {};

  // Convert FormData to plain object
  formData.forEach((value, key) => {
    data[key] = value.toString();
  });
  //console.log("Form Data:", data);
  return data;
};

export const showFormData = (e: React.SyntheticEvent<HTMLFormElement>) => {
  const data = getFormData(e);

  alert(`Form submitted with: ${JSON.stringify(data, null, 2)}`);
};
