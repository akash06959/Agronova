import { motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

export default function PaymentPage() {
  const { cart, clearCart, getCartTotal } = useCart();
  const { showSuccessNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    state: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({});
  const [cardTouched, setCardTouched] = useState({});

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          error = 'Please enter a valid 10-digit mobile number';
        }
        break;
      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.trim().length < 10) {
          error = 'Please enter a complete address';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        }
        break;
      case 'pincode':
        if (!value.trim()) {
          error = 'Pincode is required';
        } else if (!/^[1-9][0-9]{5}$/.test(value)) {
          error = 'Please enter a valid 6-digit pincode';
        }
        break;
      case 'state':
        if (!value.trim()) {
          error = 'State is required';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({
        ...errors,
        [name]: error
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched({
      ...touched,
      [name]: true
    });

    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCardField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'cardNumber':
        if (!value.trim()) {
          error = 'Card number is required';
        } else if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid 16-digit card number';
        }
        break;
      case 'cardHolderName':
        if (!value.trim()) {
          error = 'Cardholder name is required';
        } else if (value.trim().length < 2) {
          error = 'Please enter full name';
        }
        break;
      case 'expiryDate':
        if (!value.trim()) {
          error = 'Expiry date is required';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
          error = 'Please enter in MM/YY format';
        } else {
          const [month, year] = value.split('/');
          const currentDate = new Date();
          const cardYear = 2000 + parseInt(year);
          const cardMonth = parseInt(month);
          
          if (cardYear < currentDate.getFullYear() || 
              (cardYear === currentDate.getFullYear() && cardMonth < currentDate.getMonth() + 1)) {
            error = 'Card has expired';
          }
        }
        break;
      case 'cvv':
        if (!value.trim()) {
          error = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(value)) {
          error = 'Please enter a valid CVV (3-4 digits)';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
    }
    
    // Only allow digits for CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    setCardData({
      ...cardData,
      [name]: formattedValue
    });

    if (cardTouched[name]) {
      const error = validateCardField(name, formattedValue);
      setCardErrors({
        ...cardErrors,
        [name]: error
      });
    }
  };

  const handleCardBlur = (e) => {
    const { name, value } = e.target;
    
    setCardTouched({
      ...cardTouched,
      [name]: true
    });

    const error = validateCardField(name, value);
    setCardErrors({
      ...cardErrors,
      [name]: error
    });
  };

  const validateCardForm = () => {
    const newErrors = {};
    
    Object.keys(cardData).forEach(key => {
      const error = validateCardField(key, cardData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setCardErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      showSuccessNotification('Validation Error', 'Please fill in all required fields correctly', 'error');
      return;
    }

    // Validate card details if payment method is card
    if (paymentMethod === 'card') {
      const allCardTouched = {};
      Object.keys(cardData).forEach(key => {
        allCardTouched[key] = true;
      });
      setCardTouched(allCardTouched);

      if (!validateCardForm()) {
        showSuccessNotification('Validation Error', 'Please enter valid card details', 'error');
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      // Get cart items
      const cartItems = cart.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      console.log('Cart items being ordered:', cartItems);
      console.log('Total cart items count:', cartItems.length);

      // Create order data
      const orderData = {
        items: cartItems,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        shipping_address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      // Debug: Log the user ID being sent
      console.log('User ID being sent to backend:', user?.id);
      console.log('User object:', user);
      console.log('Order data:', orderData);

      // Check if user ID is a timestamp (old login) - if so, prompt re-login
      if (user?.id && user.id > 999999999) { // Timestamps are larger than regular IDs
        console.error('User ID is a timestamp, not a real database ID. Please log out and log back in.');
        showSuccessNotification('Session Expired', 'Please log out and log back in to continue.', 'error');
        setIsProcessing(false);
        return;
      }

      // Save order to database
      const response = await fetch(`${API_BASE}/orders/?user_id=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      console.log('Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Order created successfully:', responseData);
        
        // Clear cart and show success notification
        clearCart();
        showSuccessNotification('Order Placed!', `Your order has been placed successfully via ${paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}`);
        
        // Redirect to orders page
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to create order' }));
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.detail || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      showSuccessNotification('Error', error.message || 'Failed to place order. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const totalAmount = getCartTotal() + Math.round(getCartTotal() * 0.18);

  // Redirect if user not logged in
  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">Please log in to proceed with checkout.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg text-lg"
          >
            Go to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div 
            variants={fadeUp}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Items to Checkout</h1>
            <p className="text-gray-600 mb-6">Your cart is empty. Add some items to proceed with checkout.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>Continue Shopping</span>
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50" 
      variants={container} 
      initial="hidden" 
      animate="show"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/cart" className="hover:text-green-600 transition-colors">Cart</Link>
            <span>→</span>
            <span className="text-gray-700 font-medium">Checkout</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div variants={fadeUp} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Pincode"
                      maxLength="6"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="State"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3 mb-6">
                <label 
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-xl">💳</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Secure online payment</div>
                    </div>
                  </div>
                </label>
                
                <label 
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-xl">💰</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when your order arrives</div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Card Details Form */}
              {paymentMethod === 'card' && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    Card Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardInputChange}
                      onBlur={handleCardBlur}
                      className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        cardErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                    {cardErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardHolderName"
                      value={cardData.cardHolderName}
                      onChange={handleCardInputChange}
                      onBlur={handleCardBlur}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        cardErrors.cardHolderName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter cardholder name"
                    />
                    {cardErrors.cardHolderName && <p className="text-red-500 text-xs mt-1">{cardErrors.cardHolderName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardInputChange}
                        onBlur={handleCardBlur}
                        className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          cardErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {cardErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardInputChange}
                        onBlur={handleCardBlur}
                        className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          cardErrors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123"
                        maxLength="4"
                      />
                      {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-green-600 text-lg">🔒</span>
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when your order arrives</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💳 We accept Cash on Delivery for all orders. No payment gateway required.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={slideIn} className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-b-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-green-600">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium">₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{Math.round(getCartTotal() * 0.18)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={
                  isProcessing || 
                  Object.values(errors).some(err => err) || 
                  (paymentMethod === 'card' && Object.values(cardErrors).some(err => err)) ||
                  !formData.name || 
                  !formData.email || 
                  !formData.phone || 
                  !formData.address || 
                  !formData.city || 
                  !formData.pincode || 
                  !formData.state ||
                  (paymentMethod === 'card' && (!cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryDate || !cardData.cvv))
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isProcessing || 
                  Object.values(errors).some(err => err) || 
                  (paymentMethod === 'card' && Object.values(cardErrors).some(err => err)) ||
                  !formData.name || 
                  !formData.email || 
                  !formData.phone || 
                  !formData.address || 
                  !formData.city || 
                  !formData.pincode || 
                  !formData.state ||
                  (paymentMethod === 'card' && (!cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryDate || !cardData.cvv))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : paymentMethod === 'card'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Order...
                  </div>
                ) : (
                  `Place Order - ₹${totalAmount}`
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-green-600">🔒</span>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}



