import type { TaskOptions } from './types.ts';

/**
 * Manages and executes tasks with support for parallel execution and looping.
 *
 * This also works in non-browser environments.
 *
 * @example Basic usage
 * ```ts
 * const task = new Task({ maxParallelism: 2 });
 *
 * task.start();
 *
 * task.add(() => console.log('task'));
 *
 * task.addLoop(() => console.log('looping task'), 200);
 *
 * task.pause();
 * ```
 */
export class Task {
  #options: TaskOptions;

  #loopTaskMap: Map<() => unknown, number>;

  #taskQueueSet: Set<() => unknown>;

  #runningCounter: number;

  #intervalId: ReturnType<typeof setInterval> | undefined;

  /**
   * Creates a new instance of the Task class.
   *
   * @param options - The options for the task.
   */
  constructor(options: Partial<TaskOptions> = {}) {
    this.#options = {
      maxParallelism: 1,
      tickDelay: 50,
      ...options,
    };

    this.#loopTaskMap = new Map();
    this.#taskQueueSet = new Set();
    this.#runningCounter = 0;
    this.#intervalId = undefined;
  }

  /**
   * Gets the number of tasks in the queue.
   */
  get queueSize(): number {
    return this.#taskQueueSet.size;
  }

  /**
   * Gets the number of looping tasks in the collection.
   */
  get loopSize(): number {
    return this.#loopTaskMap.size;
  }

  /**
   * Gets whether there is a task currently running.
   */
  get isRunning(): boolean {
    return this.#runningCounter > 0;
  }

  /**
   * Adds a task to the queue.
   *
   * @param func - The task function to add.
   */
  add(func: () => unknown): void {
    this.#taskQueueSet.add(func);
  }

  /**
   * Adds a looping task to the collection and queue.
   *
   * @param func - The task function to add.
   * @param ms - The number of milliseconds to delay.
   */
  addLoop(func: () => unknown, ms: number): void {
    this.#loopTaskMap.set(func, ms);
    this.#taskQueueSet.add(func);
  }

  /**
   * Deletes a task from the collection and queue.
   *
   * @param func - The task function to delete.
   */
  delete(func: () => unknown): void {
    this.#loopTaskMap.delete(func);
    this.#taskQueueSet.delete(func);
  }

  /**
   * Clears all tasks from the collection and queue.
   */
  clear(): void {
    this.#loopTaskMap.clear();
    this.#taskQueueSet.clear();
  }

  /**
   * Starts executing tasks.
   */
  start(): void {
    if (this.#intervalId === undefined) {
      this.#intervalId = setInterval(() => {
        this.#run();
      }, this.#options.tickDelay);
    }
  }

  /**
   * Pauses the execution of tasks.
   */
  pause(): void {
    if (this.#intervalId !== undefined) {
      clearInterval(this.#intervalId);
      this.#intervalId = undefined;
    }
  }

  /**
   * Runs a task from the queue.
   */
  #run(): void {
    if (
      this.#taskQueueSet.size === 0 ||
      this.#runningCounter >= this.#options.maxParallelism
    ) {
      return;
    }

    const func = this.#taskQueueSet.values().next().value;

    if (!func) {
      return;
    }

    this.#taskQueueSet.delete(func);

    this.#runningCounter++;

    Promise.resolve().then(() => {
      return func();
    }).catch((exception) => {
      console.error(exception);
    }).finally(() => {
      this.#runningCounter--;

      if (this.#loopTaskMap.has(func)) {
        setTimeout(() => {
          this.add(func);
        }, this.#loopTaskMap.get(func));
      }
    });
  }
}
