
export const getChildCategory = (child) => {
  if (!child.birthDate) return null;

  const birthDate = new Date(child.birthDate);
  const now = new Date();


  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months;

 
  const ageCategories = [
    { label: "Newborn (0–12 months)", min: 0, max: 12 },
    { label: "Toddler (1–3 years)", min: 13, max: 36 },
    { label: "Preschooler (3–5 years)", min: 37, max: 60 },
    { label: "SchoolAge (6–12 years)", min: 61, max: 144 },
    { label: "Teen (13–17 years)", min: 145, max: 204 },
    { label: "YoungAdult (18–21 years)", min: 205, max: 252 },
  ];

  const category =
    ageCategories.find(
      (c) => totalMonths >= c.min && totalMonths <= c.max
    )?.label || "Unknown";

  return {
    category,
    age: { years, months, totalMonths },
  };
};
