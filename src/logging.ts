import logger from 'npmlog'

export const setupLogging = () => {
  logger.level = (process.env.LOG_LEVEL || 'info').toLowerCase()
  logger.maxRecordSize = 1000
}
