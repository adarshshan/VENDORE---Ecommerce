const Cart: React.FC = () => {
  // Static cart data for now
  const cartItems = [
    { id: 1, name: "Cute Floral Dress", price: 29.99, quantity: 1 },
    { id: 2, name: "Teddy Bear Backpack", price: 19.99, quantity: 2 },
  ];

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-center">Your cart is empty</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-4">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="text-gray-600">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="text-right mt-4">
            <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>
            <button className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 mt-4">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
