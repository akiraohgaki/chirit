/**
 * Options for Task.
 */
export interface TaskOptions {
  /**
   * The number of parallel execution.
   */
  maxParallelism: number;
  /**
   * The number of milliseconds to delay.
   */
  tickDelay: number;
}
