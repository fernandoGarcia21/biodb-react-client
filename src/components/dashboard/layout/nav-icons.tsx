import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { FediverseLogo } from '@phosphor-icons/react/dist/ssr/FediverseLogo';
import { Cat as OrganismIcon } from '@phosphor-icons/react/dist/ssr/Cat';
import { Plant as TraitIcon } from '@phosphor-icons/react/dist/ssr/Plant';
import { Leaf as PropertyIcon } from '@phosphor-icons/react/dist/ssr/Leaf';
import { Robot as BatchIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { PushPin as PushPinIcon } from '@phosphor-icons/react/dist/ssr/PushPin';
import { MapPinArea } from '@phosphor-icons/react/dist/ssr/MapPinArea';
import { CalendarCheck as ProjectIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { Link as LinkIcon } from '@phosphor-icons/react/dist/ssr/Link';
import { FileCode as TypeDatasetIcon } from '@phosphor-icons/react/dist/ssr/FileCode';
import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { Island as HabitatIcon } from '@phosphor-icons/react/dist/ssr/Island';
import { RocketLaunch as StartIcon } from '@phosphor-icons/react/dist/ssr/RocketLaunch';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  organism: OrganismIcon,
  property: PropertyIcon,
  'batch-robot': BatchIcon,
  'project-calendar': ProjectIcon,
  link: LinkIcon,
  'dataset-logo': TypeDatasetIcon,
  'push-pin': PushPinIcon,
  'map-pin-area': MapPinArea, 
  trait: TraitIcon,
  'fediverse-logo': FediverseLogo,
  'info': InfoIcon,
  habitat: HabitatIcon,
  start: StartIcon,
} as Record<string, Icon>;
