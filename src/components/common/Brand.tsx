import wordmark from "../../public/banorte.png";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`banorte-brand ${light ? "on-dark" : ""}`}>
      <span className="brand-wordmark">
        <img src={wordmark} alt="Banorte" />
      </span>
      <span className="brand-descriptor">BORIAS</span>
    </span>
  );
}
