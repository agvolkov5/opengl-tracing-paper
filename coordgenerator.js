(function() {
	let workspace = document.getElementById('workspace');
	let workspaceParent = document.getElementById('workspaceParent');
	let lines = document.getElementById('lines');
	let points = document.getElementById('points');
	let coordinates = document.getElementById('coordinates');
	let interlayer = document.getElementById('interlayer');
	let width = document.getElementById('width'), height = document.getElementById('height');
	let backgr = document.getElementById('backgr');
	let fitting = document.getElementById('fitting');
	let mousedown = false
	let shape = undefined;
	let shift = false;
	let previousShape = undefined;
	let currentShape = undefined;

	width.innerHTML = interlayer.offsetWidth;
	height.innerHTML = interlayer.offsetHeight;

	// setInterval(function(){
	// 	previousShape.classList.toggle('hover');
	// }, 0.6);

	window.addEventListener('resize', function(event) {
		event.stopPropagation();

		if (fitting.getAttribute('src').length > 0) {
			width.innerHTML = fitting.offsetWidth;
			height.innerHTML = fitting.offsetHeight;

			if (fitting.offsetHeight > fitting.offsetWidth) {
				workspace.style.height = interlayer.style.height = backgr.offsetHeight + "px";
				var newWidth = workspaceParent.offsetHeight / fitting.offsetHeight * fitting.offsetWidth;
				workspace.style.width = interlayer.style.width = newWidth + "px";
			} else {
				workspace.style.width = interlayer.style.width = backgr.offsetWidth + "px";
				var newHeight = workspaceParent.offsetWidth / fitting.offsetWidth * fitting.offsetHeight;
				workspace.style.height = interlayer.style.height = newHeight + "px";
			}
		} else {
			width.innerHTML = interlayer.offsetWidth;
			height.innerHTML = interlayer.offsetHeight;
		}

		try {
			var lines = document.getElementsByClassName('line');
			for (index in lines) {
				if (lines[index] != undefined) {
					var oldX1 = lines[index].getAttribute('x1'),
						oldX2 = lines[index].getAttribute('x2'),
						oldY1 = lines[index].getAttribute('y1'),
						oldY2 = lines[index].getAttribute('y2');

					var resolution = lines[index].getAttribute('data-resolution').split(' ');
					var oldWidth = resolution[0], oldHeight = resolution[1];

					var newX1 = interlayer.offsetWidth / oldWidth * oldX1,
						newX2 = interlayer.offsetWidth / oldWidth * oldX2,
						newY1 = interlayer.offsetHeight / oldHeight * oldY1,
						newY2 = interlayer.offsetHeight / oldHeight * oldY2;

					lines[index].setAttribute('x1', newX1);
					lines[index].setAttribute('x2', newX2);
					lines[index].setAttribute('y1', newY1);
					lines[index].setAttribute('y2', newY2);
					lines[index].setAttribute('data-resolution', interlayer.offsetWidth + ' ' + interlayer.offsetHeight);
				}
			}
		}
		catch (err) {
			console.log(err.message);
		}

		try {
			var shapes = document.getElementsByClassName('point');
			for (index in shapes) {
				if (shapes[index] != undefined) {
					var oldX = shapes[index].getAttribute('cx'),
						oldY = shapes[index].getAttribute('cy');

					var resolution = shapes[index].getAttribute('data-resolution').split(' ');
					var oldWidth = resolution[0], oldHeight = resolution[1];

					var newX = interlayer.offsetWidth / oldWidth * oldX,
						newY = interlayer.offsetHeight / oldHeight * oldY;

					shapes[index].setAttribute('cx', newX);
					shapes[index].setAttribute('cy', newY);
					shapes[index].setAttribute('data-resolution', interlayer.offsetWidth + ' ' + interlayer.offsetHeight);
				}
			}
		}
		catch (err) {
			console.log(err.message);
		}
	});

	var step = 0;

	var previousPoint = {
		x: undefined,
		y: undefined
	}

	function generatePoint(event) {
		var cursorX = event.offsetX < 0? 0 : (event.offsetX > interlayer.offsetWidth? interlayer.offsetWidth : event.offsetX),
			cursorY = event.offsetY < 0? 0 : (event.offsetY > interlayer.offsetHeight? interlayer.offsetHeight : event.offsetY);

		var pointX = 2 * (cursorX / interlayer.offsetWidth - 0.5),
			pointY = -2 * (cursorY / interlayer.offsetHeight - 0.5);

		var newCoordinatesDiv = document.createElement('div');
		newCoordinatesDiv.innerHTML = Math.round(pointX * 100) / 100 + ', ' + Math.round(pointY * 100) / 100;
		newCoordinatesDiv.setAttribute('id', 'div' + step);
		newCoordinatesDiv.setAttribute('class', 'coordinate');
		newCoordinatesDiv.setAttribute('data-resolution', interlayer.offsetWidth + ' ' + interlayer.offsetHeight);
		newCoordinatesDiv.addEventListener('mouseenter', function(event) {
			var thisId = this.getAttribute('id');
			document.getElementById('shape' + thisId.substring(3, thisId.length)).classList.add('hover');
		});
		newCoordinatesDiv.addEventListener('mouseleave', function(event) {
			var thisId = this.getAttribute('id');
			document.getElementById('shape' + thisId.substring(3, thisId.length)).classList.remove('hover');
		});
		coordinates.append(newCoordinatesDiv);

		var shapes = document.getElementsByClassName('point');
		for (index in shapes) {
			if (shapes[index].classList != undefined) {
				if (shapes[index].classList.contains('active')) {
					shapes[index].classList.remove('active');
				}
			}
		}

		var newShape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		newShape.setAttribute('cx', cursorX);
		newShape.setAttribute('cy', cursorY);
		newShape.setAttribute('r', '5');
		newShape.setAttribute('class', 'point active');
		newShape.setAttribute('id', 'shape' + step);
		newShape.setAttribute('data-lines', '');
		newShape.setAttribute('data-resolution', interlayer.offsetWidth + ' ' + interlayer.offsetHeight);
		newShape.setAttribute('oncontextmenu', 'return false');

		newShape.addEventListener('mousedown', function(event) {
			console.log('mousedown TRUE');
			mousedown = true;
			shape = this;
		});

		newShape.addEventListener('mouseup', function(event) {
			mousedown = false;
			event.stopPropagation();
			console.log('mousedown FALSE!!');
			if (shift) {
				console.log('SHIFT click');
				var newShape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				newShape.setAttribute('x1', previousPoint.x);
				newShape.setAttribute('y1', previousPoint.y);
				newShape.setAttribute('x2', this.getAttribute('cx'));
				newShape.setAttribute('y2', this.getAttribute('cy'));

				var dataLines = this.getAttribute('data-lines');
				this.setAttribute('data-lines', dataLines  + (dataLines == ''? 'line' + step : ' line' + step));

				dataLines = currentShape.getAttribute('data-lines');
				currentShape.setAttribute('data-lines', dataLines  + (dataLines == ''? 'line' + step : ' line' + step));

				newShape.setAttribute('class', 'line');
				newShape.setAttribute('id', 'line' + step);
				newShape.setAttribute('data-resolution', interlayer.offsetWidth + ' ' + interlayer.offsetHeight);
				newShape.setAttribute('oncontextmenu', 'return false');
				lines.append(newShape);

				step += 1;
			}

			var shapes = document.getElementsByClassName('point');
			for (index in shapes) {
				if (shapes[index].classList != undefined) {
					if (shapes[index].classList.contains('active')) {
						shapes[index].classList.remove('active');
					}
				}
			}
			this.classList.add('active');

			previousShape = currentShape;
			currentShape = this;

			previousPoint.x = this.getAttribute('cx');
			previousPoint.y = this.getAttribute('cy');
		});

		newShape.addEventListener('mouseenter', function(event) {
			var thisId = this.getAttribute('id');
			document.getElementById('div' + thisId.substring(5, thisId.length)).classList.add('hover');
		});

		newShape.addEventListener('mouseleave', function(event) {
			var thisId = this.getAttribute('id');
			document.getElementById('div' + thisId.substring(5, thisId.length)).classList.remove('hover');
		});

		previousShape = currentShape;
		currentShape = newShape;

		points.append(newShape);

		step += 1;

		return {
			x: cursorX,
			y: cursorY
		}
	}

	workspace.addEventListener('mouseup', function(event) {
		if (!mousedown) {
			if (shift) {
				console.log("shift click");
				var point = generatePoint(event);

				if ((previousPoint.x == undefined) || (previousPoint.y == undefined)) {
					previousPoint.x = point.x;
					previousPoint.y = point.y;
				}

				step -= 1;

				var newShape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				newShape.setAttribute('x1', previousPoint.x);
				newShape.setAttribute('y1', previousPoint.y);
				newShape.setAttribute('x2', point.x);
				newShape.setAttribute('y2', point.y);
				newShape.setAttribute('class', 'line');
				newShape.setAttribute('data-resolution', interlayer.offsetWidth + ' ' + interlayer.offsetHeight);
				newShape.setAttribute('id', 'line' + step);
				newShape.setAttribute('oncontextmenu', 'return false');
				lines.append(newShape);

				var dataLines = currentShape.getAttribute('data-lines');
				currentShape.setAttribute('data-lines', dataLines  + (dataLines == ''? 'line' + step : ' line' + step));

				dataLines = previousShape.getAttribute('data-lines');
				previousShape.setAttribute('data-lines', dataLines  + (dataLines == ''? 'line' + step : ' line' + step));

				step += 1;

				previousPoint.x = point.x;
				previousPoint.y = point.y;
			} else {
				console.log("just click");
				var point = generatePoint(event);

				previousPoint.x = point.x;
				previousPoint.y = point.y;
			}
		} else {
			event.stopPropagation();
			mousedown = false;
			console.log('mousedown FALSE!');

			var cursorX = event.offsetX < 0? 0 : (event.offsetX > interlayer.offsetWidth? interlayer.offsetWidth : event.offsetX),
				cursorY = event.offsetY < 0? 0 : (event.offsetY > interlayer.offsetHeight? interlayer.offsetHeight : event.offsetY);

			previousPoint.x = shape.getAttribute('cx');
			previousPoint.y = shape.getAttribute('cy');

			var linesIds = shape.getAttribute('data-lines');

			console.log('hello');

			if (linesIds.length > 0) {
				linesIds = linesIds.split(' ');
				for (index in linesIds) {
					var line = document.getElementById(linesIds[index]);

					var x1 = line.getAttribute('x1'),
						x2 = line.getAttribute('x2'),
						y1 = line.getAttribute('y1'),
						y2 = line.getAttribute('y2');

					if (x1 == previousPoint.x) {
						x1 = cursorX;
						y1 = cursorY;
						line.setAttribute('x1', x1);
						line.setAttribute('y1', y1);
					} else if (x2 == previousPoint.x) {
						x2 = cursorX;
						y2 = cursorY;
						line.setAttribute('x2', x2);
						line.setAttribute('y2', y2);
					}
				}
			}

			shape.setAttribute('cx', cursorX);
			shape.setAttribute('cy', cursorY);

			var id = shape.getAttribute('id');
			var idNubmer = id.substring(5, id.length);

			console.log(id, idNumber);

			var pointX = 2 * (cursorX / interlayer.offsetWidth - 0.5),
				pointY = -2 * (cursorY / interlayer.offsetHeight - 0.5);

			document.getElementById('div' + idNumber).innerHTML = pointX, ', ', pointY;

			previousPoint.x = cursorX;
			previousPoint.y = cursorY;			

			var shapes = document.getElementsByClassName('point');
			for (index in shapes) {
				if (shapes[index].classList != undefined) {
					if (shapes[index].classList.contains('active')) {
						shapes[index].classList.remove('active');
					}
				}
			}
			shape.classList.add('active');

			previousShape = currentShape;
			currentShape = shape;
		}
	});

	document.addEventListener('mousemove', function(event) {
		if (mousedown) {
			shape.style.transition = 'none';
			var cursorX = event.offsetX < 0? 0 : (event.offsetX > interlayer.offsetWidth? interlayer.offsetWidth : event.offsetX),
				cursorY = event.offsetY < 0? 0 : (event.offsetY > interlayer.offsetHeight? interlayer.offsetHeight : event.offsetY);

			previousPoint.x = shape.getAttribute('cx');
			previousPoint.y = shape.getAttribute('cy');

			var linesIds = shape.getAttribute('data-lines');

			if (linesIds.length > 0) {
				linesIds = linesIds.split(' ');
				for (index in linesIds) {
					var line = document.getElementById(linesIds[index]);

					var x1 = line.getAttribute('x1'),
						x2 = line.getAttribute('x2'),
						y1 = line.getAttribute('y1'),
						y2 = line.getAttribute('y2');

					if (x1 == previousPoint.x) {
						x1 = cursorX;
						y1 = cursorY;
						line.setAttribute('x1', x1);
						line.setAttribute('y1', y1);
					} else if (x2 == previousPoint.x) {
						x2 = cursorX;
						y2 = cursorY;
						line.setAttribute('x2', x2);
						line.setAttribute('y2', y2);
					}
				}
			}

			var id = shape.getAttribute('id');
			var idNumber = id.substring(5, id.length);

			console.log(id, idNumber);

			var pointX = Math.round(2 * (cursorX / interlayer.offsetWidth - 0.5) * 100) / 100,
				pointY = Math.round(-2 * (cursorY / interlayer.offsetHeight - 0.5) * 100) / 100;

			document.getElementById('div' + idNumber).innerHTML = pointX + ', ' + pointY;

			shape.setAttribute('cx', cursorX);
			shape.setAttribute('cy', cursorY);

			previousPoint.x = cursorX;
			previousPoint.y = cursorY;

			shape.style.transition = 'all 0.2s ease-out 0s';
		}
	});

	function KeyPress(e) {
		var evtobj = window.event? event : e
		if (evtobj.shiftKey) {
			shift = true;
		}
		if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
			step -= 1;
			if (step >= 0) {
				var div = document.getElementById('div' + step);
				if (div != undefined) {
					div.remove();
				}
				
				var shape = document.getElementById('shape' + step);
				if (shape != undefined) {
					shape.remove();
				}

				var line = document.getElementById('line' + step);
				if (line != undefined) {
					line.remove();
				}

				var line = document.getElementById('line' + (step + 1));
				if (line != undefined) {
					line.remove();
				}

				if (step > 0) {
					var previousShape = document.getElementById('shape' + step);

					i = step + 1;
					while ((i >= 0) && (previousShape == undefined)) {
						previousShape = document.getElementById('shape' + i);
						console.log('shape' + i);
						i -= 1;
					}

					if (previousShape != undefined) {
						console.log('yes');
						previousPoint.x = previousShape.getAttribute('cx');
						previousPoint.y = previousShape.getAttribute('cy');

						var shapes = document.getElementsByClassName('point');
						for (index in shapes) {
							if (shapes[index].classList != undefined) {
								if (shapes[index].classList.contains('active')) {
									shapes[index].classList.remove('active');
								}
							}
						}
						previousShape.classList.add('active');

						previousShape = currentShape;
						currentShape = previousShape;
					} else {
						console.log('no');
						previousPoint.x = undefined;
						previousPoint.y = undefined;
					}
				} else {
					previousPoint.x = undefined;
					previousPoint.y = undefined;
				}
			} else {
				step = 0;
				previousPoint.x = undefined;
				previousPoint.y = undefined;
			}

		}
	}

	document.onkeydown = KeyPress;	
	document.onkeyup = function() {
		shift = false;
	}

	function handleFileSelect(evt) {
		var file = evt.target.files[0];
		console.log(file);

		if (!file.type.match('image.*')) {
			return false
		}

		var reader = new FileReader();

		reader.onload = (function(theFile) {
        	return function(e) {
					// Render thumbnail.
					backgr.style.background = 'url(' + e.target.result + ')';
					fitting.setAttribute('src', e.target.result);
				};
			})(file);

		reader.readAsDataURL(file);
	}

	document.getElementById('files').addEventListener('change', handleFileSelect, false);

	fitting.onload = function() {
		if (fitting.getAttribute('src').length > 0) {
			width.innerHTML = fitting.offsetWidth;
			height.innerHTML = fitting.offsetHeight;

			if (fitting.offsetHeight > fitting.offsetWidth) {
				workspace.style.height = interlayer.style.height = backgr.offsetHeight + "px";
				var newWidth = workspaceParent.offsetHeight / fitting.offsetHeight * fitting.offsetWidth;
				workspace.style.width = interlayer.style.width = newWidth + "px";
			} else {
				workspace.style.width = interlayer.style.width = backgr.offsetWidth + "px";
				var newHeight = workspaceParent.offsetWidth / fitting.offsetWidth * fitting.offsetHeight;
				workspace.style.height = interlayer.style.height = newHeight + "px";
			}
		} else {
			width.innerHTML = interlayer.offsetWidth;
			height.innerHTML = interlayer.offsetHeight;
		}
	}
})();