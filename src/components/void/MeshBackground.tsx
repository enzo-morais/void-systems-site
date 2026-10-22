import "./mesh-background.css";

/**
 * Fundo do site todo: gradient mesh preto e branco. Base #050505 e algumas manchas grandes e desfocadas, em branco e cinza
 * com opacidade baixa (nunca acima de 12%), que flutuam bem devagar. Só CSS: nada de canvas nem JavaScript.
 * O login usa o motor de partículas (VoidBackground) no lugar, só para o logo animado.
 */
export function MeshBackground() {
  return (
    <div className="mesh" aria-hidden="true">
      <i className="mesh-blob mesh-b1" />
      <i className="mesh-blob mesh-b2" />
      <i className="mesh-blob mesh-b3" />
      <i className="mesh-blob mesh-b4" />
      <i className="mesh-blob mesh-b5" />
      <i className="mesh-blob mesh-b6" />
      <span className="mesh-noise" />
    </div>
  );
}
