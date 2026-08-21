/**
 * Atlas de glifos: cada caractere pré-renderizado em N níveis de opacidade,
 * numa folha só. No laço de desenho cada célula vira um drawImage recortando
 * o tile certo — nada de fillText por célula e nenhuma troca de estado do
 * contexto, que é o que pesa de verdade num campo de milhares de células.
 *
 * Colunas = glifo, linhas = nível de opacidade.
 */
export type GlyphAtlas = {
  sheet: HTMLCanvasElement;
  /** lado do tile em pixels de dispositivo */
  tile: number;
  steps: number;
};

export function buildGlyphAtlas({
  glyphs,
  cell,
  dpr,
  steps,
  ink,
  family,
  maxAlpha,
}: {
  glyphs: readonly string[];
  cell: number;
  dpr: number;
  steps: number;
  ink: string;
  family: string;
  maxAlpha: number;
}): GlyphAtlas | null {
  const tile = Math.ceil(cell * dpr);
  const sheet = document.createElement("canvas");
  sheet.width = tile * glyphs.length;
  sheet.height = tile * steps;

  const ctx = sheet.getContext("2d");
  if (!ctx) return null;

  ctx.font = `${(cell - 1) * dpr}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = ink;

  for (let step = 0; step < steps; step += 1) {
    ctx.globalAlpha = (maxAlpha * (step + 1)) / steps;
    for (let glyph = 0; glyph < glyphs.length; glyph += 1) {
      ctx.fillText(
        glyphs[glyph],
        glyph * tile + tile / 2,
        step * tile + tile / 2,
      );
    }
  }

  return { sheet, tile, steps };
}
