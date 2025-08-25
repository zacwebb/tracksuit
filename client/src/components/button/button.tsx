import type { ComponentProps } from "react";
import { memo } from "react";
import { cx } from "../../lib/cx.ts";
// TODO Does Deno support CSS Modules? https://github.com/denoland/deno/issues/11961
// @ts-ignore css modules
import styles from "./button.module.css";

type ButtonProps = {
  /** Label for the button */
  label: string;
  /** Theme of the button */
  theme?: "primary" | "secondary";
} & ComponentProps<"button">;

const ButtonComponent = ({
  label,
  theme = "primary",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button className={cx(styles.button, styles[theme], className)} {...props}>
      {label}
    </button>
  );
};

export const Button = memo(ButtonComponent);
