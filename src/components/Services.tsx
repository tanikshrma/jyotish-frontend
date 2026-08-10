import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";

const services = [
  {
    title: "5 Mukhi Rudraksha Golden Bracelet (Shiv Kavach)",
    description: "Authentic lab certified Rudraksha bracelet with gold capping.",
    image: "https://vibe.filesafe.space/1782888190245745251/attachments/54dc622f-31e9-4110-bde5-9b57ac0ce1f3.jpg",
    discount: "50% OFF",
    originalPrice: "Rs. 1,200.00",
    salePrice: "Rs. 600.00",
    rating: "5.0",
    reviewsCount: 52,
    link: "/complete-horoscope-analysis",
  },
  {
    title: "5 Mukhi Golden Cap Rudraksha Mala (44+1 Beads)",
    description: "Handcrafted 5 Mukhi Rudraksha Mala with Trishul Pendant.",
    image: "https://vibe.filesafe.space/1782888190245745251/attachments/a28543f7-fe60-49bd-b7e1-8e75e813ccfd.png",
    discount: "53% OFF",
    originalPrice: "Rs. 1,600.00",
    salePrice: "Rs. 750.00",
    rating: "4.9",
    reviewsCount: 80,
    link: "/matchmaking-consultation",
  },
  {
    title: "5 Mukhi Silver Cap Rudraksha Mala (108+1 Beads)",
    description: "Pure silver capping premium 5 Mukhi Rudraksha rosary.",
    image: "https://vibe.filesafe.space/1782888190245745251/attachments/94c5c0a6-a80c-4d0c-bc85-b33ebace0c3e.png",
    discount: "37% OFF",
    originalPrice: "Rs. 2,400.00",
    salePrice: "Rs. 1,499.00",
    rating: "4.9",
    reviewsCount: 64,
    link: "/lal-kitab-report",
  },
  {
    title: "Premium Karungali Mala (108+1 Beads)",
    description: "Certified Ebony Wood Karungali Mala with Yellow Tassel.",
    image: "https://vibe.filesafe.space/1782888190245745251/attachments/c6307ea6-2ae0-42ae-b79f-63340d67edda.png",
    discount: "53% OFF",
    originalPrice: "Rs. 1,800.00",
    salePrice: "Rs. 850.00",
    rating: "5.0",
    reviewsCount: 96,
    link: "/vastu-consultancy",
  },
];

export function Services() {
  return (
    <section id="best-sellers" className="py-20 bg-[#FAF6EE]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#4A1C08] tracking-wide mb-4">
            Shop Our Best Seller
          </h2>
          <p className="text-base md:text-lg text-[#4A1C08]/80 font-light">
            100% Authentic, Lab-Certified Rudraksha, Malas & Astrological Consultation Packages.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((product, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden bg-white border border-[#E6D5B8] rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_25px_rgba(74,28,8,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Product Image & Badge Container */}
                <div className="relative aspect-square overflow-hidden bg-[#FAF6EE] p-4 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
                  />
                  {/* Discount Pill Badge (Photo 1 matching dark brown) */}
                  <div className="absolute top-3 left-3 bg-[#4A1C08] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    {product.discount}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 text-center flex flex-col items-center">
                  <h3 className="text-base font-bold font-serif text-[#4A1C08] mb-3 line-clamp-2 min-h-[48px] hover:text-primary transition-colors">
                    {product.title}
                  </h3>

                  {/* Star Rating Badge (Photo 1 matching white pill) */}
                  <div className="inline-flex items-center gap-1 bg-white border border-yellow-300/80 px-3 py-1 rounded-full shadow-sm mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700 ml-1">({product.reviewsCount})</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                    <span className="text-lg font-bold text-[#810909]">
                      {product.salePrice}
                    </span>
                  </div>
                </CardContent>
              </div>

              {/* Action Button: Add to Cart / Book Now */}
              <div className="px-5 pb-5 pt-0">
                <Button 
                  asChild 
                  className="w-full bg-[#4A1C08] hover:bg-[#341305] text-white font-semibold h-11 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Link to={product.link}>
                    <ShoppingCart className="w-4 h-4" />
                    <span>+ Add to Cart</span>
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}