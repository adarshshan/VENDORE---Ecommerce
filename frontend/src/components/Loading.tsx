import { cn } from "../utils/cn";

interface LoadingInterface {
  className?: string;
}
const Loading: React.FC<LoadingInterface> = ({ className }) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-background flex items-center justify-center px-[1rem] sm:px-[5rem]",
        className,
      )}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
    </div>
  );
};

export default Loading;
