import { Link, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
	const { getCartItemsCount, getWishlistCount } = useCart();
	const { user, logout } = useAuth();
	
	return (
		<header className="w-full bg-white/98 backdrop-blur-lg border-b-4 border-gray-300 shadow-xl">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<nav className="flex items-center justify-between h-24">
					{/* Logo Section */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center gap-3 group">
							<div className="relative">
								<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
									<span className="text-white text-lg font-bold">🌱</span>
								</div>
								<div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-xl text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">AgroNova</span>
								<span className="text-xs text-gray-500 -mt-1">Smart Agriculture</span>
							</div>
						</Link>
					</div>

					{/* Main Navigation */}
					<div className="hidden lg:flex items-center space-x-2 ml-8">
						<NavLink 
							to="/" 
							end 
							className={({ isActive }) => 
								`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
									isActive 
										? "text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg transform scale-105" 
										: "text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-md hover:transform hover:scale-105"
								}`
							}
						>
							🏠 Home
						</NavLink>
						<NavLink 
							to="/ecommerce" 
							className={({ isActive }) => 
								`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
									isActive 
										? "text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg transform scale-105" 
										: "text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-md hover:transform hover:scale-105"
								}`
							}
						>
							🛍️ Shop
						</NavLink>
						<NavLink 
							to="/products" 
							className={({ isActive }) => 
								`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
									isActive 
										? "text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg transform scale-105" 
										: "text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-md hover:transform hover:scale-105"
								}`
							}
						>
							🌱 Products
						</NavLink>
						<NavLink 
							to="/soil" 
							className={({ isActive }) => 
								`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
									isActive 
										? "text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg transform scale-105" 
										: "text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-md hover:transform hover:scale-105"
								}`
							}
						>
							🔬 Soil Checker
						</NavLink>
					</div>


					{/* Right Side Actions */}
					<div className="flex items-center space-x-3">
						{/* User Authentication Section */}
						{user ? (
							<div className="flex items-center space-x-3">
								<Link 
									to="/dashboard" 
									className="flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
								>
									<div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
										{user.username.charAt(0).toUpperCase()}
									</div>
									<span className="text-sm font-semibold text-gray-800 hidden sm:block">Dashboard</span>
								</Link>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<Link 
									to="/login" 
									className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 shadow-sm hover:shadow-md"
								>
									🔑 Login
								</Link>
								<Link 
									to="/register" 
									className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
								>
									✨ Register
								</Link>
							</div>
						)}

						{/* Cart and Wishlist Section */}
						<div className="flex items-center space-x-2 pl-4 border-l-2 border-gray-200">
							<Link 
								to="/wishlist" 
								className="relative p-3 rounded-2xl text-gray-600 hover:text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 group shadow-sm hover:shadow-md"
							>
								<span className="text-xl group-hover:scale-110 transition-transform duration-300">❤️</span>
								{getWishlistCount() > 0 && (
									<span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
										{getWishlistCount()}
									</span>
								)}
							</Link>
							<Link 
								to="/cart" 
								className="relative p-3 rounded-2xl text-gray-600 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 group shadow-sm hover:shadow-md"
							>
								<span className="text-xl group-hover:scale-110 transition-transform duration-300">🛒</span>
								{getCartItemsCount() > 0 && (
									<span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
										{getCartItemsCount()}
									</span>
								)}
							</Link>
						</div>

						{/* Mobile Menu Button */}
						<button className="lg:hidden p-3 rounded-2xl text-gray-600 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 shadow-sm hover:shadow-md">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					</div>
				</nav>
			</div>
		</header>
	);
}
