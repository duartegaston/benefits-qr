"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type LandingHeroPhoneRevealProps = {
  children: ReactNode;
  className?: string;
};

export default function LandingHeroPhoneReveal({
  children,
  className,
}: LandingHeroPhoneRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px 35% 0px" }}
      transition={{
        duration: 0.45,
        delay: 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
