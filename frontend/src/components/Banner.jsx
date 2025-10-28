import React from 'react'

export default function Banner({ height = 'h-32' }) {
	return (
		<div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 shadow-lg border border-green-700/20 ${height}`}>
			<div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
		</div>
	)
} 