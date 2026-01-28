import React from "react";
import Card from "../ui/card";

function Cards() {
  return (
    <div className="flex gap-4 justify-center items-center flex-wrap px-2 py-1">
      <p className="align-text-top font-semibold">Stay near Baga Beach</p>
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card /> 
    </div>
  );
}
export default Cards;