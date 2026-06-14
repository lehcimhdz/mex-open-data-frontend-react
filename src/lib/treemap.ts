/**
 * Squarified-treemap layout (no d3 dependency).
 * Inputs are positive weights; outputs are rectangles inside [0, width] × [0, height].
 *
 * Adapted from Bruls, Huizing & van Wijk (2000) "Squarified Treemaps".
 */
export type TreeNode<T> = {
  data: T;
  weight: number;
};

export type Rect<T> = {
  x: number;
  y: number;
  w: number;
  h: number;
  data: T;
};

export function squarify<T>(
  nodes: TreeNode<T>[],
  width: number,
  height: number
): Rect<T>[] {
  if (!nodes.length || width <= 0 || height <= 0) return [];

  const totalWeight = nodes.reduce((s, n) => s + n.weight, 0);
  if (totalWeight <= 0) return [];
  const totalArea = width * height;
  const scaled = nodes.map((n) => ({ ...n, area: (n.weight / totalWeight) * totalArea }));

  const out: Rect<T>[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;

  const layoutRow = (row: typeof scaled, shortSide: number, ox: number, oy: number, ow: number, oh: number) => {
    const sum = row.reduce((s, n) => s + n.area, 0);
    if (shortSide === ow) {
      let cy = oy;
      const rowHeight = sum / ow;
      for (const n of row) {
        const rectW = (n.area / sum) * ow;
        out.push({ x: ox + (cy - oy === 0 ? 0 : 0), y: cy, w: rectW, h: rowHeight, data: n.data });
      }
      // build along x
      let cx = ox;
      out.length -= row.length;
      for (const n of row) {
        const rectW = (n.area / sum) * ow;
        out.push({ x: cx, y: oy, w: rectW, h: rowHeight, data: n.data });
        cx += rectW;
      }
      return rowHeight;
    } else {
      // build along y
      let cy = oy;
      const rowWidth = sum / oh;
      for (const n of row) {
        const rectH = (n.area / sum) * oh;
        out.push({ x: ox, y: cy, w: rowWidth, h: rectH, data: n.data });
        cy += rectH;
      }
      return rowWidth;
    }
  };

  const worst = (row: typeof scaled, side: number) => {
    if (!row.length) return Infinity;
    const sum = row.reduce((s, n) => s + n.area, 0);
    const sideSq = side * side;
    let max = -Infinity;
    let min = Infinity;
    for (const n of row) {
      if (n.area > max) max = n.area;
      if (n.area < min) min = n.area;
    }
    const sumSq = sum * sum;
    return Math.max((sideSq * max) / sumSq, sumSq / (sideSq * min));
  };

  let queue = scaled.slice();
  while (queue.length) {
    const side = Math.min(w, h);
    const row: typeof scaled = [];
    while (queue.length) {
      const candidate = [...row, queue[0]];
      if (row.length === 0 || worst(candidate, side) <= worst(row, side)) {
        row.push(queue.shift()!);
      } else {
        break;
      }
    }
    const consumed = layoutRow(row, side, x, y, w, h);
    if (side === w) {
      y += consumed;
      h -= consumed;
    } else {
      x += consumed;
      w -= consumed;
    }
  }

  return out;
}
