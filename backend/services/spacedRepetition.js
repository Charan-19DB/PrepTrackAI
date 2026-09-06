import Revision from '../models/Revision.js';

const REVISION_INTERVALS = [1, 3, 7, 14, 30]; // in days

export const getNextRevisionDate = (stageIndex = 1) => {
  const daysToAdd = REVISION_INTERVALS[stageIndex - 1] || 30;
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

export const scheduleTopicRevision = async (userId, topicId, subjectName, topicName, stage = 1) => {
  try {
    const scheduledDate = getNextRevisionDate(stage);
    
    // Check if an active revision for this topic and stage already exists
    let revision = await Revision.findOne({
      userId,
      subjectName,
      topicName,
      revisionStage: stage,
      status: 'Pending'
    });

    if (!revision) {
      revision = await Revision.create({
        userId,
        topicId,
        subjectName,
        topicName,
        revisionStage: stage,
        scheduledDate,
        status: 'Pending'
      });
    }

    return revision;
  } catch (error) {
    console.error('[Spaced Repetition Error]:', error.message);
    return null;
  }
};
