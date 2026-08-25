import { motion } from "framer-motion";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <>
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`
            absolute -inset-[10px] opacity-15
            [--white-gradient:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)]
            [--aurora:repeating-linear-gradient(100deg,#3b82f6_10%,#8b5cf6_20%,#06b6d4_30%,#3b82f6_40%,#8b5cf6_50%,#06b6d4_60%,#3b82f6_70%,#8b5cf6_80%,#06b6d4_90%,#3b82f6_100%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[15px] invert-0
            after:content-[''] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] 
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-10 will-change-transform
          `}
          >
            <style>{`
              @keyframes aurora {
                from { background-position: 50% 50%, 50% 50%; }
                to { background-position: 350% 50%, 350% 50%; }
              }
              .animate-aurora {
                animation: aurora 60s linear infinite;
              }
            `}</style>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default AuroraBackground;
