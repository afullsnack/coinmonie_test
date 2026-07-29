import { useEffect, useState } from 'react'

const formatRemaining = (ms: number) => {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000))
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const QuoteCountdown = ({ expiry }: { expiry: string }) => {
	const [remainingMs, setRemainingMs] = useState(() => new Date(expiry).getTime() - Date.now())

	useEffect(() => {
		const interval = setInterval(() => {
			setRemainingMs(new Date(expiry).getTime() - Date.now())
		}, 1000)
		return () => clearInterval(interval)
	}, [expiry])

	const expired = remainingMs <= 0

	return (
		<span className={expired ? 'text-destructive' : ''}>
			{expired ? 'Rate expired' : `Rate valid for ${formatRemaining(remainingMs)}`}
		</span>
	)
}

export default QuoteCountdown
