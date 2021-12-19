import { useEffect, useState } from 'react';
import './App.css';
import ResultCard from './components/ResultCard/ResultCard';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function App() {
  const [title, setTitle] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);
	const [calculatedResult, setCalculatedResult] = useState('');
  const [calculations, setCalculations] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [draggableItems, setDraggableItems] = useState([...calculations]);

	// handle file upload field
	const handleFileUpload = e => {
		const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      document.getElementById('chosenFile').textContent = file.name;
    }
	};

	// handle submit / calculate
	const handleSubmit = e => {
		e.preventDefault();

    // file validation
    if (!selectedFile) {
      alert('No file chosen! Please upload a text file.');
      return;
    } 
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'txt') {
      alert('File type error! Please upload a text file.');
      return;
    }

		setIsProcessing(true);

		// clear form
		const clearForm = () => {
      e.target.reset();
			setIsProcessing(false);
      document.getElementById('chosenFile').textContent = '';
    }

		// process calculation
		const processCalculation = () => {
			const reader = new FileReader();
			reader.readAsText(selectedFile);
			reader.onload = () => {
				const calculation = reader.result;
				if (calculation !== '') {
					try {
						const result = parseFloat(eval(calculation).toFixed(3)).toString();
						// save to database
						const calculationDB = { title, calculation, result }
						axios({
							method: 'POST',
							url: 'https://stormy-fjord-64350.herokuapp.com/calculations',
							data: calculationDB
						})
							.then((res) => {
								// console.log(res.data);
								if (res.data.insertedId) {
									setCalculatedResult(result);
								}
							})
							.catch((err) => {
								console.log(err);
							})
					}
					catch (err) {
						alert('Invalid equation detected!\nPlease try again.');
					}
					finally {
						clearForm();
					}
				} else {
					alert('The text file is empty!');
					clearForm();
				}
			};

			reader.onerror = () => {
				console.log('file error', reader.error);
			};
		}

		setTimeout(processCalculation, 15000);
	};

  // load results
	useEffect(() => {
		fetch('https://stormy-fjord-64350.herokuapp.com/calculations')
			.then(res => res.json())
			.then(data => {
				const reversed = data.reverse();
				setCalculations(reversed);
				setDraggableItems(reversed);
			})
      .catch(err => console.log(err))
	}, [calculatedResult]);

	// handle drag end
	const handleOnDragEnd = result => {
		if (!result.destination) return;

    const items = Array.from(draggableItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDraggableItems(items);
	}

	return (
		<div className="App">
			<header className="header">
				<h1>Calculate from text file</h1>
			</header>

			<main>
				<div className="screens-wrapper">
					<div className="screen input-screen">
						<div className="inner">
							<h2 className="title">Total results: {calculations.length}</h2>
							<DragDropContext onDragEnd={handleOnDragEnd}>
								<Droppable droppableId="results-wrapper">
									{provided => (
										<ul
											className="results-wrapper"
											{...provided.droppableProps}
											ref={provided.innerRef}
										>
											{draggableItems.map((item, index) => (
												<Draggable key={item._id} draggableId={item._id} index={index}>
													{provided => (
														<li
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
														>
															<ResultCard item={item} />
														</li>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</ul>
									)}
								</Droppable>
							</DragDropContext>
							<div className="more-results">⦿ ⦿ ⦿ ⦿ ⦿</div>
							<div className="input-wrapper">
								<h2 className="title">Input</h2>
								<form onSubmit={handleSubmit}>
									<input
										required
										type="text"
										name="title"
										placeholder="Calculation title *"
										className="title-input"
										onBlur={e => setTitle(e.target.value)}
									/>
									<div className="upload-field">
										<label htmlFor="uploadInput">
											<input
												type="file"
												accept=".txt"
												id="uploadInput"
												onChange={handleFileUpload}
											/>
											<b id="chosenFile">{''}</b> <br />
											<img src="https://www.svgrepo.com/show/255836/txt.svg" alt="txt icon" />{' '}
											<br />
											Drop your calculation text file here
										</label>
									</div>
									<div className="btn-wrapper">
										<input
											type="submit"
											value="Calculate"
											className="button"
											disabled={isProcessing ? true : false}
										/>
										{isProcessing && <div className="waiting">Calculating, Please wait .&#160;<span>&#46; &#46;</span></div>}
									</div>
								</form>
							</div>
						</div>
					</div>

					<div className="screen result-screen">
						<div className="inner">
							<h2 className="title">Total results: {calculations.length}</h2>
							<div className="results-wrapper">
								{draggableItems.map(item => (
									<ResultCard key={item._id} item={item} />
								))}
							</div>
							<div className="more-results">more results</div>
						</div>
					</div>
				</div>
			</main>

			<footer>
				<small>
					Developed by{' '}
					<a
						href="https://fullwebdev.com"
						target="_blank"
						rel="noreferrer"
						style={{ fontWeight: '600' }}
					>
						Fazle Rabbi
					</a>
				</small>
			</footer>
		</div>
	);
}

export default App;
