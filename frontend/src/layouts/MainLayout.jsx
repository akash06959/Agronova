import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
	return (
		<div className="min-h-screen w-full flex flex-col">
			<Navbar />
			<main className="max-w-7xl mx-auto p-4 flex-grow">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
} 