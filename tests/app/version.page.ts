import { VERSION } from '../../mod.ts';
import { addLog, createActions } from './page.ts';

export default function (): void {
  createActions({
    'var-version': () => {
      addLog(VERSION);
    },
  });
}
