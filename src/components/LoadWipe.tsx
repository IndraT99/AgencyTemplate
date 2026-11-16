import { LOAD_WIPE_PATH } from '../lib/data';

export function LoadWipe() {
  return (
    <div className="load-wipe" data-load-wipe="" aria-hidden="true">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path data-wipe-path="" d={LOAD_WIPE_PATH} />
      </svg>
    </div>
  );
}
