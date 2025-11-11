export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:"100%",
        maxWidth:"200px",
        padding:"10px 16px",
        background:"var(--color-primary)",
        color:"#fff",
        border:"none",
        borderRadius:"var(--radius-sm)",
        cursor:"pointer",
        fontSize:"var(--font-sm)"
      }}
    >
      {children}
    </button>
  );
}