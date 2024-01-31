import { VERSION } from './mod.bundle.js';
import { addLog } from './page.js';

export default function () {
  addLog(`version: ${VERSION}`);
}
