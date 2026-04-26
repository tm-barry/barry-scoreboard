import {
  ArrowBigLeft,
  ArrowBigRight,
  Check,
  Frame,
  Menu,
  Minus,
  Monitor,
  Network,
  Pencil,
  Plus,
  RotateCcw,
  Trash,
  Trophy,
  X,
} from '@lucide/vue';
import Baseball from './Baseball.vue';
import Basketball from './Basketball.vue';

const icons = {
  // Lucide Icons
  arrowBigLeft: ArrowBigLeft,
  arrowBigRight: ArrowBigRight,
  check: Check,
  frame: Frame,
  menu: Menu,
  minus: Minus,
  monitor: Monitor,
  network: Network,
  pencil: Pencil,
  plus: Plus,
  rotateCcw: RotateCcw,
  trash: Trash,
  trophy: Trophy,
  x: X,

  // Custom Icons
  baseball: Baseball,
  basketball: Basketball,
} as const;

export default icons;

export type IconName = keyof typeof icons;
