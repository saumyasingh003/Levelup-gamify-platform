import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      
      {/* Bottom */}
      <div className="bg-black text-white text-center text-sm py-4">
        © {new Date().getFullYear()} Gamified Learning. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;