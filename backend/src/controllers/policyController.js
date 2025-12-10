import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { alertingService } from '../services/alert.js';
import { AccessModel } from '../utils/constants.js';

let currentAccessModel = AccessModel.RBAC;

export const getCurrentModel = async () => {
  try {
    const db = getDb();
    const setting = await db.collection('settings').findOne({ key: 'accessModel' });
    if (setting) {
      currentAccessModel = setting.value;
    }
  } catch (e) {
    // Use default
  }
  return currentAccessModel;
};

export const setModel = async (model, adminUser) => {
  if (adminUser.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only system administrators can change access control models');
  }
  
  const oldModel = currentAccessModel;
  currentAccessModel = model;
  
  const db = getDb();
  await db.collection('settings').updateOne(
    { key: 'accessModel' },
    { $set: { value: model } },
    { upsert: true }
  );
  
  await createLogEntry(adminUser._id, adminUser.username, 'CONFIG_CHANGE', `Access Model changed from ${oldModel} to ${model}`, 'SUCCESS');
  alertingService.alertConfigChange(adminUser._id, adminUser.username, 'ACCESS_MODEL_CHANGE', { from: oldModel, to: model });
};

export default { getCurrentModel, setModel };

