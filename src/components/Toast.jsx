import React from 'react';

// Toast supports an optional action (label + callback). Parent controls visibility.
export default function Toast({ msg, actionLabel, onAction, className }) {
	return (
		<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow flex items-center gap-3 ${className || ''}`}>
			<div className="flex-1">{msg}</div>
			{actionLabel && onAction && (
				<button onClick={onAction} className="underline text-sm">{actionLabel}</button>
			)}
		</div>
	);
}