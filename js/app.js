

const search_button = document.querySelector('.btn-search'); //selecting the search button
const key = 'fe1e6859377e4ab3b2244075b5cfeae7';

search_button.addEventListener('click',getInputValue);
function getInputValue(){
	
	var search_string = document.getElementById('search').value;
	var food1 = search_string.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''); //replacing harmful chars
	var food = encodeURI(food1); //encoding the string 

	

	//getting the value of dropdown list
	const s = document.getElementById('meals-type');
	const meals_type = s.options[s.selectedIndex].value;

	// I am including the wine section in the drop down...
	if( meals_type === 'wine') {
		// here we will fetch only wines... time to get stoned
		
		get_some_wine(food,meals_type);
	} else {
		// calling the fetch food function 
		fetch_food(food,meals_type);
	}


	
}


async function fetch_food(food, meals_type){
	
	const instructions =true; // setting it true will provide more info about the recipes

	// building the url with all the user's requests
	const url = `https://api.spoonacular.com/recipes/complexSearch/?apiKey=fe1e6859377e4ab3b2244075b5cfeae7&query=${food}&addRecipeInformation=${instructions}&type=${meals_type}&number=60`;
	if(meals_type === '' || meals_type == null){
		const url = `https://api.spoonacular.com/recipes/complexSearch/?apiKey=fe1e6859377e4ab3b2244075b5cfeae7&query=${food}&addRecipeInformation=${instructions}&number=60`;
	}
	


	// clearing the root element if not null
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}
	
	const response = await fetch(url);

	const json = await response.json();
	
	if(json.results.length !== 0){

			 const search_text = document.createElement('h2');
			 search_text.className = 'most-popular';
			 search_text.innerText = "Food you were looking for...";
			 document.querySelector('#root').appendChild(search_text);

			 //creating the div element with class cards because it is deleted above
			 const cards = document.createElement('div');
			 cards.className = 'cards';
			 cards.id = 'root-card';
			 document.querySelector('#root').appendChild(cards);

		json.results.forEach(element => {
			document.querySelector('.cards').innerHTML += `
			<div class="card">
			<div class="card__image-holder">
			<img class="card__image" src="${element.image}" alt="${element.title}" />
			</div>
			<div class="card-title">
			<a href="" class="toggle-info btn">
				<span class="left"></span>
				<span class="right"></span>
			</a>
			<h2>
			${element.title}
				<small>Source: ${element.sourceName}</small>
			</h2>
			</div>
			<div class="card-flap flap1">
			<div class="card-description">
				${element.summary}
			</div>
			<div class="card-flap flap2">
				<div class="card-actions">
				<a href="${element.sourceUrl}" class="btn" onclick="window.open(this.href,'_blank');">Read more</a>
				</div>
			</div>
			</div>
		</div>
			`;
			}
		);
		} else {
			 const error_text = document.createElement('h2');
			 error_text.className = 'most-popular  error-padding';
			 error_text.innerText = "Sorry, we can't find anything";
			 document.querySelector('.cards').appendChild(error_text);
		}
}


async function get_some_wine(food,meals_type) {
	let url;
	
	// checking the value of checkbox
	
	const radio_val = document.querySelector('input[name="button-group"]:checked').value;
	//console.log(radio_val);

	// according to the radio button value making the url
	if(radio_val === 'recommend'){ 
		url = `https://api.spoonacular.com/food/wine/recommendation/?apiKey=${key}&wine=${food}&number=15`;		
		recommend_wine(url);
	} 
	else if(radio_val === 'description') {
		url = `https://api.spoonacular.com/food/wine/description/?apiKey=${key}&wine=${food}`;
		describe_wine(url,food);
		
	} else  {// else give the pairing of wine with food 
		
		url = `https://api.spoonacular.com/food/wine/pairing/?apiKey=${key}&food=${food}`;
		pair_wine(url,food);		
	}
}


async function recommend_wine(url){
	const response = await fetch(url);
	const json = await response.json();
	
	/* document.querySelector('.cards').innerHTML = ''; */

	const root_card = document.getElementById('#root-card');
	
	
	//clearing the space if it is not null
	if(!$('#root-card').is(':empty') ){
		$('#root-card').empty();
	}

	if(json.recommendedWines.length !== 0){

		const search_text = document.createElement('h2');
		search_text.className = 'most-popular error-padding';
		search_text.innerText = "Wines you were dreaming for...";
		document.querySelector('#root-card').appendChild(search_text);


		json.recommendedWines.forEach(element => {
			document.querySelector('#root-card').innerHTML += `
			<div class="card">
			<div class="card__image-holder">
			<img class="card__image" src="${element.imageUrl}" alt="${element.title}" />
			</div>
			<div class="card-title">
			<a href="" class="toggle-info btn">
				<span class="left"></span>
				<span class="right"></span>
			</a>
			<h2>
			${element.title}
				<small>Price: ${element.price}</small>
			</h2>
			</div>
			<div class="card-flap flap1">
			<div class="card-description">
				${element.description}
			</div>
			<div class="card-flap flap2">
				<div class="card-actions">
				<a href="${element.link}" class="btn" onclick="window.open(this.href,'_blank');">View on amazon</a>
				</div>
			</div>
			</div>
		</div>
			`;
			}
		);
   } else {
		const error_text = document.createElement('h2');
		error_text.className = 'most-popular  error-padding';
		error_text.innerText = "Sorry, we can't find anything";
		document.querySelector('.cards').appendChild(error_text);
   }
}



async function describe_wine(url,food){
	const response = await fetch(url);
	const json = await response.json();
	
	//empty the cards
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}; 

	if(json.wineDescription.length !== 0){

		const search_text = document.createElement('h2');
		search_text.className = 'most-popular';
		search_text.innerText = `In a nutshell...`;
		document.querySelector('#root').appendChild(search_text);

		document.querySelector('#root').innerHTML += `
		<div class="wine-desc">
		<h2> ${food.charAt(0).toUpperCase() + food.slice(1)} </h2><br>
		<p>${json.wineDescription}</p>
		<img src="images/Wine_shop.jpg"></img>
	  </div>
		`;

	} else {
		const error_text = document.createElement('h2');
		error_text.className = 'most-popular  error-padding';
		error_text.innerText = "Sorry, we can't find anything";
		document.querySelector('#root-card').appendChild(error_text);
	}
}






async function pair_wine(url,food){
	const response = await fetch(url);
	const json = await response.json();
	
	
	
	if(!$('#root-card').is(':empty') ){
		$('#root-card').empty();
	}
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}

	if(json.pairedWines.length !== 0){

		const search_text = document.createElement('h2');
		search_text.className = 'most-popular';
		search_text.innerText = `Wines matched with ${food}`;
		document.querySelector('#root').appendChild(search_text);

		// adding the html 
		document.getElementById('root').innerHTML += `
		<div class="big-card">
		<section class="wine-card">
		  <h1>Wine Matches</h1> 
		  <div class="content">
		  <h3>${json.pairedWines[0]}, ${json.pairedWines[1]}, ${json.pairedWines[2]}</h3>
			<p>${json.pairingText}</p>
		  </div>
		  <div class="img"><img class="wine-img" src="images/wine-card.jpg" />
		  </div>
		</section>
	  </div>`;
		
	} else{
		const error_text = document.createElement('h2');
		error_text.className = 'most-popular error-padding';
		error_text.innerText = "Sorry, we can't find anything";
		document.querySelector('#root-card').appendChild(error_text);
	}

                
    
}











