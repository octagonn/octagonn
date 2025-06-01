
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Reviews = () => {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent backdrop-blur-xs"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div 
          ref={ref}
          className={`max-w-2xl mx-auto scroll-reveal ${isVisible ? 'visible' : ''}`}
        >
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="ph ph-star-fill text-3xl text-accent mx-1"></i>
              ))}
            </div>
            <h2 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-4">
              Leave A Google Review!
            </h2>
            <p className="text-xl text-white/80 mb-8 font-light">
              Help us grow by sharing your experience with others. Your feedback helps our community find reliable IT support.
            </p>
          </div>

          <Button
            asChild
            className="neomorphic-btn text-lg px-8 py-4"
          >
            <a
              href="https://g.page/r/Ca4pUoaLIJ6MEAE/review"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="ph ph-pencil-simple mr-2"></i>
              Write a Review
              <i className="ph ph-arrow-square-out ml-2"></i>
            </a>
          </Button>

          <div className="mt-12 glassmorphic rounded-xl p-8">
            <h3 className="text-2xl font-light tracking-tight text-white mb-4">
              What Our Customers Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-light text-accent mb-2">Fast</div>
                <div className="text-white/70 font-light">Same-day service available</div>
              </div>
              <div>
                <div className="text-3xl font-light text-accent mb-2">Reliable</div>
                <div className="text-white/70 font-light">Solutions that last</div>
              </div>
              <div>
                <div className="text-3xl font-light text-accent mb-2">Honest</div>
                <div className="text-white/70 font-light">No hidden fees or upsells</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
