const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">PropertyRental</h3>
            <p className="text-gray-400">
              Your trusted platform for buying and renting properties in Nepal.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/properties" className="hover:text-white">Browse Properties</a></li>
              <li><a href="/properties/add" className="hover:text-white">List Property</a></li>
              <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">
              Email: info@propertyrental.com<br />
              Phone: +977-1-XXXXXXX
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PropertyRental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

