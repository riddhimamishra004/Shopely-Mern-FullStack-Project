export default function Loader({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-stone-200 border-t-orange-600`}
      role="status"
      aria-label="Loading"
    />
  );
}