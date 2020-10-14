

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
	} else if(food1.toLowerCase() === 'list wine' || food1.toLowerCase() === 'List wine' || food1.toLowerCase() === 'list wines' || food1.toLowerCase() === 'List wines' ) {//list the all the wines if user enters list wine in the search bar
		list_wines();
	}else {
		// calling the fetch food function 
		fetch_food(food,meals_type);
	}	
}

function list_wines() {
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}

	document.querySelector('#root').innerHTML += `
	<div class = "wine-list">
	<h2 class="most-popular">Wine list</h2>
	<ol >
	<li class = "wine-list-start">
	  White wine</li>
		<ul style="list-style-type:disc">
		  <li>Dry white wine</li>
		  <ul style="list-style-type:circle">
			
			 <li>assyrtiko
			 <li>pinot blanc
			 <li>cortese
			 <li>roussanne
			 <li>moschofilero
			 <li>muscadet
			 <li>viognier
			 <li>verdicchio
			 <li>greco
			 <li>marsanne
			 <li>white burgundy
			 <li>chardonnay
			 <li>gruener veltliner
			 <li>white rioja
		 </ul>
	
		<li>mueller thurgau
		<li>grechetto
		<li>gewurztraminer
		<li>chenin blanc
		<li>white bordeaux
		<li>semillon
		<li>riesling
		<li>sauternes
		<li>sylvaner
		<li>lillet blanc
		</ul>
	
	  <li class = "wine-list-start">Red wine</li>
		<ul style="list-style-type:disc">
		<li>Dry red wine
		  <ul style="list-style-type:circle">
		   <li>petite sirah
		   <li>zweigelt
		   <li>baco noir
		   <li>bonarda
		   <li>cabernet franc
		   <li>bairrada
		   <li>barbera wine
		   <li>primitivo
		   <li>pinot noir
		   <li>nebbiolo
		   <li>dolcetto
		   <li>tannat
		   <li>negroamaro
		   <li>red burgundy
		   <li>corvina
		   <li>rioja
		   <li>cotes du rhone
		   <li>grenache
		   <li>malbec
		   <li>zinfandel
		   <li>sangiovese
		   <li>carignan
		   <li>carmenere
		   </ul>
		 <br>
	
		<li>bordeaux
		<li>marsala
		<li>port
		<li>gamay
		<li>dornfelder
		<li>concord wine
		<li>sparkling red wine
		<li>pinotage
		<li>agiorgitiko
		</ul>
	
	  <li class = "wine-list-start">Dessert wine</li>
	  <ul style="list-style-type:disc">
	   <li> pedro ximenez
		<li>moscato
		<li>late harvest
		<li>ice wine
		<li>white port
		<li>lambrusco dolce
		<li>madeira
		<li>banyuls
		<li>in santo
		<li>port
		</ul>
		<br>
	
	  
	  <li class = "wine-list-start">Sparkling wine</li>
	  <ul style="list-style-type:disc">
		<li>cava
		<li>cremant
		<li>champagne
		<li>prosecco
		<li>spumante
		<li>sparkling rose
		</ul><br>
	  <li class = "wine-list-start">Sherry</li>
		<ul style="list-style-type:disc"><li>cream sherry
		<li>dry sherry
		</ul><br>
	  <li class = "wine-list-start">Vermouth</li>
		<ul style="list-style-type:disc"><li>dry vermouth
	</ol></div>
	`;
}



async function fetch_food(food, meals_type){

	// clearing the root element if not null
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}
	displayLoader();
	
	const instructions =true; // setting it true will provide more info about the recipes

	// building the url with all the user's requests
	const url = `https://api.spoonacular.com/recipes/complexSearch/?apiKey=fe1e6859377e4ab3b2244075b5cfeae7&query=${food}&addRecipeInformation=${instructions}&type=${meals_type}&number=60`;
	if(meals_type === '' || meals_type == null){
		const url = `https://api.spoonacular.com/recipes/complexSearch/?apiKey=fe1e6859377e4ab3b2244075b5cfeae7&query=${food}&addRecipeInformation=${instructions}&number=60`;
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
		hideLoader();
		} else {
			if(!$('#root').is(':empty') ){
				$('#root').empty();
			}
			 const error_text = document.createElement('div');
			 error_text.innerHTML = '<img src="images/error_img/food_error.png" alt="recipe not found error" class="food_err"></img><h1 class="food_err_text">Oops! I have never prepared that.</h1>';
			 document.querySelector('#root').appendChild(error_text);
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

	//clearing the space if it is not null
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}

	displayLoader();
	const response = await fetch(url);
	const json = await response.json();
	
	/* document.querySelector('.cards').innerHTML = ''; */

	const root_card = document.getElementById('#root-card');
	
	
	
	if(json.status !== 'failure'){
	if(json.recommendedWines !== 0){

		const search_text = document.createElement('h2');
		search_text.className = 'most-popular';
		search_text.innerText = "Wines you were dreaming for...";
		document.querySelector('#root').appendChild(search_text);

		//creating the div element with class cards because it is deleted above
		const cards = document.createElement('div');
		cards.className = 'cards';
		cards.id = 'root-card';
		document.querySelector('#root').appendChild(cards);
		
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
		hideLoader();
   } 
	}else {
		if(!$('#root').is(':empty') ){
			$('#root').empty();
		}
		const error_text = document.createElement('div');
		error_text.innerHTML = '<img src="images/error_img/drunk.png" alt="still drunk?" class="food_err"></img><h1 class="food_err_text">Are you drunk too? Because I have never heard of a wine with that name.</h1>';
		document.querySelector('#root').appendChild(error_text);

   }
}



async function describe_wine(url,food){
	//empty the cards
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	} 

	displayLoader();
	const response = await fetch(url);
	const json = await response.json();
	

	if(json.status !== 'failure'){
	if(json.wineDescription.length !== 0){

		const search_text = document.createElement('h2');
		search_text.className = 'most-popular';
		search_text.innerText = `In a nutshell...`;
		document.querySelector('#root').appendChild(search_text);

		document.querySelector('#root').innerHTML += `
		<div class="wine-desc">
		<h2> ${food.charAt(0).toUpperCase() + food.slice(1)} </h2><br>
		<p>${json.wineDescription}</p>
		<img src="images/desc/${Math.floor(Math.random()*13)}.jpg"></img>
	  </div>
		`;
		hideLoader();
	} 
	}else {
		if(!$('#root').is(':empty') ){
			$('#root').empty();
		}
		const error_text = document.createElement('div');
		error_text.innerHTML = '<img src="images/error_img/drunk.png" alt="still drunk?" class="food_err"></img><h1 class="food_err_text">Are you drunk too? Because I have never heard of a wine with that name.</h1>';
		document.querySelector('#root').appendChild(error_text);
	}
}






async function pair_wine(url,food){
	//first clear the previous things
	if(!$('#root-card').is(':empty') ){
		$('#root-card').empty();
	}
	if(!$('#root').is(':empty') ){
		$('#root').empty();
	}
	displayLoader();
	const response = await fetch(url);
	const json = await response.json();

	
	
	if(json.status !== 'failure'){
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
		  <h3>${json.pairedWines[0]}, ${json.pairedWines[1]}</h3>
			<p>${json.pairingText}</p>
		  </div>
		  <div class="img"><img class="wine-img" src="images/match/${Math.floor(Math.random()*13)}.jpg" />
		  </div>
		</section>
	  </div>`;
		hideLoader();
	} 
	}else{
		if(!$('#root').is(':empty') ){
			$('#root').empty();
		}
		const error_text = document.createElement('div');
		error_text.innerHTML = '<img src="images/error_img/drunk.png" alt="still drunk?" class="food_err"></img><h1 class="food_err_text">Are you drunk too? Because I have never heard of a wine with that name.</h1>';
		document.querySelector('#root').appendChild(error_text);
	}

                
    
}





function displayLoader(){
	document.querySelector('#root').innerHTML = `
	<div class="loader-container">
      <div class="loader">
        <div class="dash uno"></div>
        <div class="dash dos"></div>
        <div class="dash tres"></div>
        <div class="dash cuatro"></div>
      </div>
      <div class="loading-text">Cooking..</div>
	</div>`;
	
}

function hideLoader(){
	
	$('.loader-container').fadeOut('slow',function(){
		$('.loader-container').hide();
		
	});
}







