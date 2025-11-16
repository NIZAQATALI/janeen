export const getUserStage = (user) => {
  // --------------------------
  // BABY STAGE (using user.birthDate)
  // --------------------------
  if (user.birthDate) {
    const diff = Date.now() - new Date(user.birthDate);
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

    // 12+ months → Year stage
    if (months >= 12) {
      return {
        category: "baby",
        stageType: "year",
        stageValue: Math.floor(months / 12), // e.g., 1 year old
      };
    }

    // < 12 months → Month stage
    return {
      category: "baby",
      stageType: "month",
      stageValue: months, // e.g., 7 months old
    };
  }

  // --------------------------
  // PREGNANCY STAGE
  // --------------------------
  if (user.pregnancyStartDate) {
    const diff = Date.now() - new Date(user.pregnancyStartDate);
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

    let trimester = 1;
    if (weeks >= 28) trimester = 3;
    else if (weeks >= 14) trimester = 2;

    return {
      category: "pregnancy",
      stageType: "trimester",
      stageValue: trimester,
    };
  }

  // --------------------------
  // DEFAULT → MEN
  // --------------------------
  return {
    category: "men",
    stageType: "general",
    stageValue: 1,
  };
};
