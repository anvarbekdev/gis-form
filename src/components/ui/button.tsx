export default function Button({ children, onClick, styleClass }: any) {
  return (
    <button className={styleClass} onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}
