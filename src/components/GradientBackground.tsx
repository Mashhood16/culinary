interface GradientBackgroundProps {
  lightGradient: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Renders a div with a gradient background.
 * The gradient shows behind children (e.g. an image) to fill empty space
 * with colors that match the image.
 */
export default function GradientBackground({ 
  lightGradient,
  className = '',
  children 
}: GradientBackgroundProps) {
  return (
    <div 
      className={className}
      style={{ background: lightGradient }}
    >
      {children}
    </div>
  );
}
