export function CursorMarquee() {
  return (
    <div
      className="cursor-marquee"
      data-cursor-marquee=""
      data-cursor-marquee-status="not-active"
      data-cursor-marquee-running="false"
      aria-hidden="true"
    >
      <div className="cursor-marquee-card">
        <div className="cursor-marquee-track">
          <span className="cursor-marquee-copy" data-cursor-marquee-copy="">
            View case →
          </span>
          <span
            className="cursor-marquee-copy cursor-marquee-copy--clone"
            data-cursor-marquee-copy=""
          >
            View case →
          </span>
        </div>
      </div>
    </div>
  );
}
