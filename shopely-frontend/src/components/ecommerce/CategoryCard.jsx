import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative block overflow-hidden rounded-xl"
    >
      <div className="aspect-square w-full overflow-hidden bg-stone-100">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-4 left-4 text-base font-semibold text-white sm:text-lg">
        {category.name}
      </span>
    </Link>
  );
}