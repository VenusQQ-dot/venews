/**
 * 彩色流沙背景:純 CSS、只動 transform(合成層動畫,不觸發重繪),
 * prefers-reduced-motion 時自動凍結為靜態色彩。
 */
export default function FlowingBackground() {
  return (
    <div className="sand-bg" aria-hidden>
      <span className="sand-blob sand-blob--1" />
      <span className="sand-blob sand-blob--2" />
      <span className="sand-blob sand-blob--3" />
      <span className="sand-blob sand-blob--4" />
    </div>
  );
}
