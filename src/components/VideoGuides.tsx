import React from "react";

const videos = [
  "UTqw0c4pnho",
  "S-_ZzZIGv_Q",
  "7zP6F1HBtmw",
  "ChVGeTRnqSs"
];

export const VideoGuides = () => {
  return (
    <section className="py-20 bg-background relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
            Your Guide to <span className="text-primary">Cosmic Wisdom</span>
          </h2>
          <p className="text-black/80 max-w-4xl mx-auto text-lg">
            Watch our YouTube videos where Dr. Sandeep breaks down complex planetary transits into simple, practical advice. Get your monthly horoscope, powerful remedies, and authentic guidance to help navigate life's challenges with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((videoId, index) => (
            <div 
              key={index} 
              className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-border/50 bg-black"
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={`YouTube video player ${index + 1}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
