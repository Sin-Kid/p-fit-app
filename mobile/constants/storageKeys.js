/**
 * Shared storage keys for Step Tracking reconciliation
 * Both foreground hook (useStepCounter) and background task (stepBackgroundTask)
 * use these exact keys to synchronize state in AsyncStorage.
 */
export const STORAGE_KEYS = {
  PERSISTED_STEPS: '@pfit_step_tracker_persisted_total',
  LAST_TIMESTAMP: '@pfit_step_tracker_last_timestamp',
  SAVED_DATE: '@pfit_step_tracker_saved_date',
};

export const TASK_NAMES = {
  BACKGROUND_STEP_SYNC: 'PFIT_BACKGROUND_STEP_SYNC_TASK',
};
