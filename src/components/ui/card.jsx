import React from "react";
import hotel from "../../assets/hotels/hotel-1.jpeg";

function Card() {
  return<div>
    <img src={hotel} alt="Hotel" className="h-100 w-100 object-cover rounded-xl" />
  </div>;
}

export default Card;