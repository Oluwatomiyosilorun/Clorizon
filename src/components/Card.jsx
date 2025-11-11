export default function Card({ title, children }) {
  return (
    <div className="widget-container">
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {children}
    </div>
  );
}