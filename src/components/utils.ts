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
