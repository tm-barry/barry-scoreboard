import {
  ArrowBigLeft,
  ArrowBigRight,
  Frame,
  Menu,
  Minus,
  Monitor,
  Network,
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
  frame: Frame,
  menu: Menu,
  minus: Minus,
  monitor: Monitor,
  network: Network,
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
