import * as PhosphorIcons from "@phosphor-icons/react";

import { type IconName } from "../interfaces";
import type { ComponentType } from "react";

interface IconProps extends PhosphorIcons.IconProps {
  name: IconName;
}

export function Icon({ name, color = "black", ...rest }: IconProps) {
  const BaseIcon = PhosphorIcons[
    name
  ] as ComponentType<PhosphorIcons.IconProps>;

  return <BaseIcon color={color} {...rest} />;
}
