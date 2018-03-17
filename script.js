//TODO 1.	Prilikom ucitavanje stranice (kao reakcija na document ready 
//			dogadjaj) potrebno je ucitati Top Rated filmove i prikazati ih na stranici
//TODO 2. 	Implementirati prikaz Top Rated, Upcoming i Now Playing filmova kao reakcija
//			na klik odgovarajuceg itema iz navigation bar-a
//TODO 3.	Kada korisnik klikne na neki poster od prikazanih filmova potrebno mu je prikazati
//			detalje o tom filmu.
//TODO 4.	Ako su prikazani detalji o nekom filmu omoguciti prikaz slicnih filmova (Show Simmilar dugme)
//TODO 5.	Omoguciti pretragu filmova
//TODO 6. 
//TODO 7.	Improvizovati paginaciju prilikom prikaza Top Rated, Upcoming i Now Playing filmova


$(document).ready(function(){
	//Promenljive potrebne za TODO 7.
	//-------------------------------
	var shown = "top";
	var total_pages;
	var current_page;
	var pagination_set = false;
	//-------------------------------

	var api_key = "api_key=d6567c81b3f90902e0886a226056f0d6";
	var base_url ="https://api.themoviedb.org/3";
	
	//TODO 1.
	//-------------------- 
	var req_url =  base_url + "/movie/top_rated?" + api_key;
	$.getJSON(req_url, addMovies);

	function addMovies(data){
		//TODO 7.
		//------------------------------
		//Za potrebe paginacije iz odgovora cuvamo vrednosti o
		//trenutno prikazanoj stranici(iz APIa se vidi da server po default
		//vraca po 20 filmova i to naziva page, tj. prvih 20 je page = 1, drugi
		//20 je page=2 etc.)
		current_page = data.page; 
		total_pages = data.total_pages;
		//Pri prvom zahtevu, element nema prave vrednosti za paginaciju
		//tj. potrebno inicijalizovati paginaciju sa vrednostima o page-u i total_pages
		//Za to koristim pagination_set flag
		if(!pagination_set){ 
			setPagination();
		}
		//-----------------------------

		//Prilikom ucitavanja novih filmova, potrebno je izbrisati postojece i postaviti nove
		var $posters = $(".posters");
		$posters.empty();

		//Radi lepseg izgleda, potrebno je smestiti po cetri filma u jedan red sa filmovima
		//Zbog toga definsemo promenljivu $row van .each petlje, kako bi mogli da ubacujemo
		//filmove u nju dok ne ubacimo 4 filma, nakon toga potrebno je napraviti novi div
		//u koji ponovo ubacujemo filmove
		var $row;
		

		var movies = data.results;
		$.each(movies, function(index,value){
			//Ukoliko smo dodali 4 filma napraviti nowi row div i dodati ga u $posters div
			//(index % 4) vraca celobrojni ostatak pri deljenu sa brojem cetri
			//tj. 0 % 4 == 0, 1 % 4 == 1, 2 % 4 == 2, 4 % 4 = 0, 5 % 4 == 1, 8 % 4 == 0, etc.
			//Sto znaci da na osnovu index-a elementa niza mozemo zakljuciti da li je potrebno
			//film dodati u novi red, tj ako je index 4 8 12, taj element treba dodati u novi red
			if(index % 4 == 0){
				$posters.append("<br/>");
				$row = $("<div class='row'></div>");
				$posters.append($row);
			}

			var $div = $("<div class='col-md-3'></div>");
			var $img = $("<img></img>");
			//Kao vrednosti poster koji prikazujemo na stranici, biramo poster sa widthom od 300px
			//I cuvamo id tog filma u atribut id img taga.
			$img.attr({ 
				src : "http://image.tmdb.org/t/p/w300" + value.poster_path,
				title: value.title,
				id: value.id,
				class: "img-thumbnail"
			});
			$div.append($img);
			$row.append($div);
			
		});
	}
	//-------------------------
	//TODO 2.
	//----------------------------------------------------
	$("#topRated").click(function(){
		//TODO 7.
		//----------------------
		pagination_set = false;
		shown = "top";
		//----------------------

		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		$("h2.naslov").text("Top Rated Movies");

		var req_url =  base_url + "/movie/top_rated?" + api_key;
		$.getJSON(req_url, addMovies);
	});

	$("#upcoming").click(function(){
		//TODO 7.
		//----------------------
		pagination_set = false;
		shown = "upcoming";
		//----------------------

		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		$("h2.naslov").text("Upcoming Movies");

		var req_url =  base_url + "/movie/upcoming?" + api_key;
		$.getJSON(req_url, addMovies);
	});

	$("#nowplaying").click(function(){
		//TODO 7.
		//----------------------
		pagination_set = false;
		shown = "now";
		//----------------------

		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		$("h2.naslov").text("Now Playing");

		var req_url =  base_url + "/movie/now_playing?" + api_key;
		$.getJSON(req_url, addMovies);
	});
	//----------------------------------------------------------------------

	//TODO 3.	Klikom na film, odnosno img tag nekog filma potrebno je da 
	//			preuzmemo podatke o tom filmu i da ih prikazemo, za izgled
	//			prikaza pogledati sample html kod koji birsemo/menjamo.
	//----------------------------------------------------------------------
	$(".container").on("click","img", function(e){
		//Iza APIa vidimo da url za preuzimanje podataka ima formu /movie/{movie_id}?
		//movie_id smo sacuvali kao atribut id img taga
		var req_url = base_url + "/movie/" + $(this).attr("id") + "?" + api_key;
		//Ako je vec bio prikazan neki film zelimo da se ti podaci sakriju sa fade efektom
		$(".movie").fadeOut(100);

		$.getJSON(req_url,function(data,status){
			//Dobijene podatke potrebno je staviti u odgovarajuce html elemente
			var $movieDiv = $(".movie");

			//Za poster u ovom slucaju koristimo sliku sa widthom od 185px, http://image.tmdb.org/t/p/w185/
			var $img = $movieDiv.find("img");
			$img.attr("src", "http://image.tmdb.org/t/p/w185" + data.poster_path);
			//Menjamo podatke o title filma, potrebno je da postavimo naziv i godinu u obliku
			// "Naziv Filma (godina)" i sve to treba da bude kao link ka odgovarajucoj imdb stranici
			// data.release_date dolazi u formatu YYYY-MM-DD (1997-06-12), a kada odradimo split dobicemo niz oblika ["1997","06","12"]
			$movieDiv.find("a.title").text(data.title + " (" + data.release_date.split("-")[0] + ")")
									 .attr("href", "http://www.imdb.com/title/" + data.imdb_id);
			

			var $ul = $movieDiv.find("ul");
			$ul.empty();
			//Trajanje filma je dato u minutima npr. 175 minuta a potrebno je da trajanje zapisemo
			//u formatu: 2h 55m, to postizemo tako sto vreme podelimo sa 60 i parsiramo kao Int da dobijemo celobrojnu vrednost
			$ul.append("<li>" + parseInt(data.runtime/60) + "h " + data.runtime%60 + "min</li>");
			$ul.append("<li>|</li>");
			
			$.each(data.genres, function(index, value){
				var $li = $("<li></li>");
				var text = "" + value.name;
				//Zarez ne dodajemo na poslednji element, tj. na element sa indexom length-1
				if(index != data.genres.length-1)
					text +=",";
				
				$li.text(text);
				$ul.append($li);
			});
			$ul.append("<li>|</li>");
			
			//Formatiramo datum pomocu odgovarajuceg formatera
			var formater = new Intl.DateTimeFormat("sr");
			$ul.append("<li>" + formater.format(new Date(data.release_date)) + "</li>");
			$ul.append("<li>|</li>");
			
			$ul.append("<li>Rating: " + data.vote_average + 
				"<span class='glyphicon glyphicon-star' style='color:#ffcc00'></span> - " 
				+ data.vote_count + " votes</li>");

			$movieDiv.find("#description").text(data.overview);

			var productionCompaines = "";
			$.each(data.production_companies,function(index, value){
				productionCompaines += value.name;
				if(index != data.production_companies.length-1)
					productionCompaines += ", ";
			});

			$movieDiv.find("#production").text("Production companies: " + productionCompaines);
			
			//Formatiramo budzet i revenu pomocu USD formatera
			var l10nUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
			$movieDiv.find("#budget").text("Budget: " + l10nUSD.format(data.budget));
			$movieDiv.find("#revenue").text("Revenue: " + l10nUSD.format(data.revenue));
			
			$movieDiv.find("#tagline").text("Tagline: " + data.tagline);


			if($movieDiv.css("display") == "none")
				$movieDiv.slideDown("slow");
			else{
				$movieDiv.fadeIn();
			}
			//TODO 4. Prikazati show simmilar dugme i postaviti id filma kao ide dugmeta
			//---------------------------------------
			$("button.simmilar").show(10).attr({
												id: data.id,
												title: $("a.title").text() 
											});
			//---------------------------------------
			
		});
	});
	//---------------------------------------------------------------------------------

	//TODO 4. Klikom na dugme show similar ucitati slicne filmove trenutno prikazanom flimu
	//---------------------------------------------------------------------------------
	$(".container").on("click", "button.simmilar", function(){
		var movieId = $(this).attr("id");
		var movieTitle = $(this).attr("title");
		$("h2.naslov").text("Similar to: " + movieTitle);

		var req_url =  base_url + "/movie/" + movieId +"/similar?" + api_key;
		$.getJSON(req_url, addMovies);
		
	});
	//---------------------------------------------------------------------------------
	
	//TODO 5. Pretraga
	//---------------------------------------------------------------------------------
	$("button.search").click(function(){
		var query = "query="+$("#tbInput").val();
		var req_url =  base_url + "/search/movie?" + query + "&" + api_key;
		$("h2.naslov").text("Results for: " + $("#tbInput").val());
		$.getJSON(req_url, addMovies);
	});
	//---------------------------------------------------------------------------------


	//TODO 7. Improvizati paginaciju (ovo je bolje odraditi next i prev pager-om)
	//---------------------------------------------------------------------------------

	//Ukoliko se stranica ucitava prvi put, odnosno ako se menja total_pages broj
	//potrebno je inicijalizovati paginaciju
	function setPagination(){
		//Postavljamo flag na true
		pagination_set = true;

		var $ulPag = $("ul.pagination");
		$ulPag.empty();
		
		//Generisemo 5 elemenata za paginaciju
		var i;
		for(i = current_page; i < current_page + 5; i++){
			var li = $("<li></li>");
			var a = $("<a href='#' title='"+i+"''>"+i+"</a>");
			li.append(a);
			//Pri cemu dodajemo active klasu trenutno ucitanoj stranici
			if(i == current_page){
				li.addClass("active");
			}
			$ulPag.append(li);

			//Ukoliko je i == total_pages prekidamo dodavanje brojeva stranica
			//npr. ako imamo ukupno 2 stranice na stranici zelimo samo da dodamo
			//paginaciju za 1 i 2, a ne za 1 2 3 4 i 5
			if(i == total_pages)
				break;
		}

		//Ukoliko je nakon dodavanja elemenata i < total pages potrebno je dodati i ">>"
		if(i < total_pages){
			var li = $("<li></li>");
			var a = $("<a href='#' title='"+i+"''></a>");
			a.text(">>");
			li.append(a);
			$ulPag.append(li);
		}
	}

	//Ukoliko kliknemo na promenu stranice potrebno je ucitati element 
	//i eventualno updatovati paginaciju
	$("ul.pagination").on("click", "a", function(){
		var $ulPag = $("ul.pagination");
		//Pamtimo koju stranicu zelimo da dobijemo tako sto vrednost preuzimamo
		//iz atributa title 
		var request_page = parseInt($(this).attr("title")); 
		//Ako ocekujete da ce te npr. vrsiti sabiranje sa tim brojem obavezno ga parsirati
		//bez parsiranje bi imali nesto tipa "5" + 1 koje bi vratilo "51" a ne 6 koje ocekujemo

		//Ukoliko je korisnik kliknuo na [>>] potrebno je ucitati filmove sa te strane
		//i updatovati paginaciju npr:
		//	[1] [2] [3] [4] [5] [>>]
		// na
		// [<<] [6] [7] [8] [9] [10] [>>]		
		if($(this).text() == ">>"){
			$ulPag.empty(); //Brisemo elemente paginacije zbog update-a
			//Razmatramo situaciju ako imamo npr. 8 strana
			//Kada korisnik klikne na [>>]
			//Trebalo bi da prikazemo: [<<] [4] [5] [6] [7] [8], a ne [<<] [6] [7] [8] [9] [10]
			if(request_page + 5 >= total_pages){
				var i;
				var flag = false;
				//To se moze postici tako sto ce mo krenuti u suprotnom smeru dodavanja
				//tj. da radimo prepend, prvo dodamo [8], pa [7] sto nam daje [7] [8]...
				for(i = total_pages; i > total_pages - 5; i--){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.prepend(li);
					//U slucaju da stigne do elementa 1 potrebno je da tu zaustavimo
					//dodavanje kako ne bi dodao -1
					if(i == 1){ //Ovo nikada ne bi trebalo da se desi
						flag = true;
						break;
					}
				}
				if(!flag){ //Ukoliko flag nije true, tj. poslednji element nije 1, dodati [<<]
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text("<<");
					li.append(a);
					$ulPag.prepend(li);
				}
			}else{
				//U slucaju da je request_page + 5 < total_pages potrebno je dodati [>>]
				var li = $("<li></li>");
				var a = $("<a href='#' title='"+(request_page+5)+"'></a>");
				a.text(">>")
				li.append(a);
				$ulPag.append(li);

				var i;
				var flag = false;
				// +4 posto dodajemo 4 elementa posle request page-a
				for(i = request_page + 4; i >= request_page; i--){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.prepend(li);
					if(i == 1){
						flag = true;
						break;
					}
				}
				if(!flag){ //Ako nije dodat [1] dodaj [<<];
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text("<<");
					li.append(a);
					$ulPag.prepend(li);
				}
			}
		}else if($(this).text() == "<<"){
			$ulPag.empty();
			//Isto kao i za [>>] samo u obrnutom redosledu sa append
			//npr. ako je bilo [<<] [3] [4] [5] [6] [7]
			//potrebno je da krenemo od [1] 
			if(request_page - 5 <= 1){
				var i;
				var flag = false;
				// 1 + 5 == 6 //Zelimo da imamo 5 elemenata
				for(i = 1; i < 6; i++){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.append(li);

					if(i == total_pages){
						flag = true;
						break;
					}
				}
				if(!flag){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text(">>");
					li.append(a);
					$ulPag.append(li);
				}
			}else{
				var li = $("<li></li>");
				var a = $("<a href='#' title='"+(request_page-5)+"'></a>");
				a.text("<<")
				li.append(a);
				$ulPag.append(li);
				var flag = false;
				var i;
				for(i = request_page - 4; i <= request_page; i++){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.append(li);
					if(i == total_pages){
						flag = true;
						break;
					}
				}
				if(!flag){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text(">>");
					li.append(a);
					$ulPag.append(li);
				}
			}
		}else{
			//Ukoliko je korisnik kliknu na broj onda nema potrebe da updateujemo paginaciju
			//samo promenimo activni element
			$(this).parent().siblings().removeClass("active");
			$(this).parent().addClass("active");
		}

		//U zavisnosti sta je bilo prikazano, saljemo zahtev za trazenu stranicu
		switch(shown){
			case "top":
				var req_url =  base_url + "/movie/top_rated?" + api_key + "&" + "page=" + request_page; 
				$.getJSON(req_url, addMovies);
			break;
			case "upcoming":
				var req_url =  base_url + "/movie/upcoming?" + api_key + "&" + "page=" + request_page;
				$.getJSON(req_url, addMovies);
			break;
			case "now":
				var req_url =  base_url + "/movie/now_playing?" + api_key + "&" + "page=" + request_page;
				$.getJSON(req_url, addMovies);
				break;
		}
	});
	//-------------------------------------------------------------------

	

	


	

	$(".container").on("mouseenter",".posters img",function(){
		$(this).fadeTo(50,0.7);
	});
	$(".container").on("mouseleave",".posters img",function(){
		$(this).fadeTo(50,1);
	})
});