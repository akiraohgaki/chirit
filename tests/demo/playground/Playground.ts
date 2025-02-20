interface GlobalPlayground {
  code: {
    run: () => Promise<void>;
    get: () => Element;
    set: (data: string) => void;
    clear: () => void;
  };
  preview: {
    get: () => Element;
    set: (data: unknown) => void;
    clear: () => void;
  };
  logs: {
    get: () => Element;
    add: (data: unknown) => void;
    clear: () => void;
  };
  sleep: (ms: number) => Promise<void>;
}

// @ts-ignore because globalThis.playground has no type definition
const _playground: GlobalPlayground = globalThis.playground;

class PlaygroundTest {
  constructor(name: string) {
    _playground.logs.add(name);
  }

  async step(
    name: string,
    func: (context: PlaygroundTest) => unknown,
  ): Promise<boolean> {
    return await Promise.resolve().then(() => {
      return func(this);
    }).then((result) => {
      if (name) {
        _playground.logs.add(`${name} ... Passed`);
      }
      if (result !== undefined) {
        _playground.logs.add(result);
      }
      return true;
    }).catch((exception) => {
      if (name) {
        _playground.logs.add(`${name} ... Failed`);
      }
      _playground.logs.add(exception);
      return false;
    });
  }
}

export class Playground {
  static code = _playground.code;

  static preview = _playground.preview;

  static logs = _playground.logs;

  static sleep = _playground.sleep;

  static async test(
    name: string,
    func: (context: PlaygroundTest) => unknown,
  ): Promise<boolean> {
    const playgroundTest = new PlaygroundTest(name);
    return await playgroundTest.step('', func);
  }
}
