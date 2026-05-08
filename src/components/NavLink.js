'use client';

import Link from "next/link";
import { forwardRef } from "react";

const NavLink = forwardRef(
  ({ className, activeClassName, href, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };