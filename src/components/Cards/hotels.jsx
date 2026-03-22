import Card from "../ui/card";
import { udaipurHotels, goaHotels, mumbaiHotels } from "../../data/hotels";

function Cards() {
  return (
    <div className="w-full px-6 py-8">
      <Card hotels={udaipurHotels} title="Popular homes in Udaipur" />
      <Card hotels={goaHotels} title="Top Picks in Goa" />
      <Card hotels={mumbaiHotels} title="Places to stay in Mumbai" />

      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
          padding: 10px 5px;
          margin: -10px -5px;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Cards;