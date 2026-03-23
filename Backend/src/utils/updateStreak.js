export const updateStreak = async (progress) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastVisit = progress.lastVisit ? new Date(progress.lastVisit) : null;
  if (lastVisit) {
    lastVisit.setHours(0, 0, 0, 0);
  }

  let updated = false;

  if (!lastVisit) {
    progress.streak = 1;
    progress.lastVisit = new Date();
    updated = true;
  } else {
    const diffTime = today - lastVisit;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      progress.streak += 1;
      progress.lastVisit = new Date();
      updated = true;
    } else if (diffDays > 1) {
      progress.streak = 1;
      progress.lastVisit = new Date();
      updated = true;
    }
  }

  if (updated) {
    await progress.save();
  }
  
  return progress;
};
