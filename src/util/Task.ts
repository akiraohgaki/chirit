import type { TaskOptions } from './types.ts';

/**
 * Manage and execute tasks.
 *
 * This class provides a way to manage tasks with support for parallel execution and looping tasks.
 *
 * This class also work in non-browser environment.
 *
 * ----
 *
 * @example Basic usage
 * ```ts
 * const task = new Task({ maxParallelism: 2 });
 *
 * task.start();
 *
 * task.add(() => console.log('task'));
 *
 * task.addLoop(async () => console.log('looping task'), 200);
 *
 * task.pause();
 * ```
 */
export class Task {
  #options: TaskOptions;

  #loopTaskCollection: Map<() => unknown, number>;

  #taskQueue: Set<() => unknown>;

  #runningCounter: number;

  #intervalId: ReturnType<typeof setInterval> | undefined;

  /**
   * Creates a new instance of the Task class.
   *
   * @param options - The options for configuring the task.
   */
  constructor(options: Partial<TaskOptions> = {}) {
    this.#options = {
      maxParallelism: 1,
      tickDelay: 50,
      ...options,
    };

    this.#loopTaskCollection = new Map();
    this.#taskQueue = new Set();
    this.#runningCounter = 0;
    this.#intervalId = undefined;
  }

  /**
   * Checks if any task is currently running.
   */
  isRunning(): boolean {
    return this.#runningCounter > 0;
  }

  /**
   * Adds a task to the queue.
   *
   * @param func - The task function to add.
   */
  add(func: () => unknown): void {
    this.#taskQueue.add(func);
  }

  /**
   * Adds a looping task to the collection and queue.
   *
   * @param func - The task function to add.
   * @param ms - The number of milliseconds to delay.
   */
  addLoop(func: () => unknown, ms: number): void {
    this.#loopTaskCollection.set(func, ms);
    this.#taskQueue.add(func);
  }

  /**
   * Deletes a task from the collection and queue.
   *
   * @param func - The task function to delete.
   */
  delete(func: () => unknown): void {
    this.#loopTaskCollection.delete(func);
    this.#taskQueue.delete(func);
  }

  /**
   * Clears all tasks from the collection and queue.
   */
  clear(): void {
    this.#loopTaskCollection.clear();
    this.#taskQueue.clear();
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
      this.#taskQueue.size === 0 ||
      this.#runningCounter >= this.#options.maxParallelism
    ) {
      return;
    }

    const func = this.#taskQueue.values().next().value;

    if (!func) {
      return;
    }

    this.#taskQueue.delete(func);

    this.#runningCounter++;

    Promise.resolve().then(() => {
      return func();
    }).catch((exception) => {
      console.log(exception);
    }).finally(() => {
      this.#runningCounter--;

      if (this.#loopTaskCollection.has(func)) {
        setTimeout(() => {
          this.add(func);
        }, this.#loopTaskCollection.get(func));
      }
    });
  }
}
