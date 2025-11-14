import { cn } from "@/lib/utils";

export function SmallAppleSpinner({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
    >
      <g>
        <rect
          opacity=".917"
          x="14"
          y="1"
          width="4"
          height="10"
          rx="2"
          fill="currentColor"
        />
        <rect
          opacity="0.89"
          x="4"
          y="6.82837"
          width="4"
          height="10"
          rx="2"
          transform="rotate(-45 4 6.82837)"
          fill="currentColor"
        />
        <rect
          opacity="0.34"
          x="21"
          y="18"
          width="4"
          height="10"
          rx="2"
          transform="rotate(-90 21 18)"
          fill="currentColor"
        />
        <rect
          opacity="0.67"
          x="6.82861"
          y="27.8994"
          width="4"
          height="10"
          rx="2"
          transform="rotate(-135 6.82861 27.8994)"
          fill="currentColor"
        />
        <rect
          opacity="0.23"
          x="20.7588"
          y="13.7932"
          width="4"
          height="10"
          rx="2"
          transform="rotate(-133.604 20.7588 13.7932)"
          fill="currentColor"
        />
        <rect
          opacity="0.56"
          x="18"
          y="31"
          width="4"
          height="10"
          rx="2"
          transform="rotate(180 18 31)"
          fill="currentColor"
        />
        <rect
          opacity="0.45"
          x="27.8994"
          y="25.071"
          width="4"
          height="10"
          rx="2"
          transform="rotate(135 27.8994 25.071)"
          fill="currentColor"
        />
        <rect
          opacity="0.78"
          x="1"
          y="18"
          width="4"
          height="10"
          rx="2"
          transform="rotate(-90 1 18)"
          fill="currentColor"
        />
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875"
          values="0 16 16;45 16 16;90 16 16;135 16 16;180 16 16;225 16 16;270 16 16;315 16 16"
          dur="0.83333s"
          begin="0s"
          repeatCount="indefinite"
          calcMode="discrete"
        ></animateTransform>
      </g>
    </svg>
  );
}
