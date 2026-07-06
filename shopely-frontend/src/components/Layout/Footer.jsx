import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold tracking-tight text-stone-900">
              Shop<span className="text-orange-600">ly</span>
            </span>
            <p className="mt-3 text-sm text-stone-500">
              Quality products, delivered fast.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="text-stone-400 transition-colors hover:text-orange-600"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-stone-400 transition-colors hover:text-orange-600"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-stone-400 transition-colors hover:text-orange-600"
              >
                <FaTwitter size={18} />              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-500">
              <li>
                <Link to="/shop" className="hover:text-orange-600">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=electronics" className="hover:text-orange-600">Electronics</Link>
              </li>
              <li>
                <Link to="/shop?category=fashion" className="hover:text-orange-600">Fashion</Link>
              </li>
              <li>
                <Link to="/shop?category=home-living" className="hover:text-orange-600">Home & Living</Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-500">
              <li>
                <Link to="/profile/orders" className="hover:text-orange-600">Track Order</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-600">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-orange-600">FAQs</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-orange-600">Returns & Refunds</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / contact */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Stay Updated</h3>
            <p className="mt-3 text-sm text-stone-500">
              Get updates on new products and offers.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2">
              <Mail size={15} className="text-stone-400" />
              <input
                type="email"
                placeholder="Your email"
                className="w-full text-sm outline-none placeholder-stone-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-stone-200 pt-6 text-sm text-stone-500 sm:flex-row">
          <p>&copy; {year} Shopely. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-orange-600">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-orange-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}