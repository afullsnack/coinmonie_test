// COMPLETED can't be reverted by a later webhook/reconciliation check.
// FAILED can still be corrected to COMPLETED.
export const LOCKED_STATUSES = ['COMPLETED']
