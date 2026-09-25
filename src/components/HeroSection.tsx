export function HeroSection() {
  return (
    <section
      id="hero-skeleton"
      className="hero-section bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 min-h-[200px]"
    >
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </section>
  );
}