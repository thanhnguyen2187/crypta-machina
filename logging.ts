export interface Logger {
  error(msg: object): void
  warn(msg: object): void
  info(msg: object): void

  /**
   * Make sure that the logged out data also include the data.
   * */
  extend(data: object): Logger
}

export function createLogger(data: object): Logger {
  return {
    error(msg: object) {
      console.error({...data, ...msg})
    },
    warn(msg: object) {
      console.warn({...data, ...msg})
    },
    info(msg: object) {
      console.info({...data, ...msg})
    },

    extend(otherData: object): Logger {
      return createLogger({...data, ...otherData})
    },
  }
}
