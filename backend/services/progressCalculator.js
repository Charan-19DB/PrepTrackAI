/**
 * Calculates weighted topic progress:
 * Theory = 25%
 * Assessment = 25%
 * Practical = 30%
 * Interview = 20%
 */
export const calculateTopicProgress = (topic, userProgress) => {
  if (!topic) return 0;

  const theoryTotal = topic.theoryItems?.length || 1;
  const assessmentTotal = topic.assessmentItems?.length || 1;
  const practicalTotal = topic.practicalItems?.length || 1;
  const interviewTotal = topic.interviewItems?.length || 1;

  const theoryDone = userProgress?.theoryCompleted?.length || 0;
  const assessmentDone = userProgress?.assessmentCompleted?.length || 0;
  const practicalDone = userProgress?.practicalCompleted?.length || 0;
  const interviewDone = userProgress?.interviewCompleted?.length || 0;

  const theoryScore = Math.min(1, theoryDone / theoryTotal) * 25;
  const assessmentScore = Math.min(1, assessmentDone / assessmentTotal) * 25;
  const practicalScore = Math.min(1, practicalDone / practicalTotal) * 30;
  const interviewScore = Math.min(1, interviewDone / interviewTotal) * 20;

  const total = Math.round(theoryScore + assessmentScore + practicalScore + interviewScore);
  return Math.min(100, Math.max(0, total));
};

export const determineStatusFromProgress = (progress, currentStatus) => {
  if (progress === 100) return 'Mastered';
  if (progress >= 80) return 'Completed';
  if (progress >= 50) return 'Practicing';
  if (progress > 0) return 'Learning';
  return currentStatus || 'Not Started';
};
