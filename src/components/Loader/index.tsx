import "./styles.css";

export function Loader({ color = "#fd8915" }: { color?: string }) {
  return (
    <div className="loader">
      <span style={{ background: color }}></span>
      <span style={{ background: color }}></span>
      <span style={{ background: color }}></span>
    </div>
  );
}
