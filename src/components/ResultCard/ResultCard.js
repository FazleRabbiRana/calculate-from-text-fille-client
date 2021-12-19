import React, { useState } from 'react';
import './ResultCard.css';

const ResultCard = ({ item }) => {
	const [activePopup, setActivePopup] = useState(false);
	const showInput = () => {
		// alert(item?.calculation);
		setActivePopup(true);
	}

	return (
		<>
			<div className="result-card">
				<p>= {item?.result}</p>
				<h6>{item?.title}</h6>
				<button className='button' onClick={showInput}>
					See Input
				</button>
			</div>

			<div 
				className={activePopup ? 'popup active' : 'popup'}
			>
				<div className="inner">
					<button onClick={() => setActivePopup(false)}>&times;</button>
					<h3>{item?.title}</h3>
					<p>{item?.calculation}</p>
				</div>
			</div>
		</>
	);
};

export default ResultCard;