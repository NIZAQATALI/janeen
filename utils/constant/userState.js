
export const getPregnancyInfo = (user) => {
  if (user.pregnancyStage !== "Pregnancy" || !user.pregnancyStartDate) {
    return null;
  }
  const now = new Date();
  const start = new Date(user.pregnancyStartDate);
  const diffMs = now - start;
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const months = Math.floor(diffMs / (30 * 24 * 60 * 60 * 1000)); 
  let trimester;
  if (weeks < 13) trimester = "trimester-1";
  else if (weeks < 27) trimester = "trimester-2";
  else trimester = "trimester-3";
  return {
    weeks,
    months,
    trimester,
    estimatedDueDate: new Date(start.getTime() + 280 * 24 * 60 * 60 * 1000), 
  };
};
