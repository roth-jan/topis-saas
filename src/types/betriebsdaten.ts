import type { TopisObject, Gang, FFZ, Hall, Path, PathArea, Conveyor } from './topis';

export interface LayoutSnapshot {
  objects: TopisObject[];
  gaenge: Gang[];
  ffz: FFZ[];
  halls: Hall[];
  paths: Path[];
  pathAreas: PathArea[];
  conveyors: Conveyor[];
}
