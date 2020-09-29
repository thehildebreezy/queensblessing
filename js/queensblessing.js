/**
 * API by https://spoonacular.com/food-api/
 */
$(function(){

    /**
     * While this variable is true, we will disable the actions of changing pages
     * This will allow us to have some fancy transitions without worrying too much
     * about the animations being interrupted.
     * We are also going to skip queuing any new page requests to simplify actions
     */
    var changingPages = false;


    $("#collapse").on("click",function(){
        var bar = $(".collapse-bar");
        if ( bar.hasClass("collapsed") ){
            bar.removeClass('collapsed');
        } else {
            bar.addClass('collapsed');
        }
    });


    $("#loadcards").on("click",function(){


        // load demo
        loadDemo();


    })

    function loadDemo(){

        // layer this business
        $.get('js/demo.json', function( data ){
            

            //var apiData = JSON.parse(data)
            var apiData = data;
            if( !apiData ) return

            if( apiData.results.length == 0 ) return

            $.get('templates/list-card.html', function( data ){

                var el = $(data);

                for( var i=0; i<apiData.results.length; i++ ){
                    var next = el.clone();
                    var link = $("<a>");
                    link.attr('href','#')
                    link.addClass(['stretched-link','text-dark'])
                    link.html(apiData.results[i]["title"])
                    next.find('.card-header').html("").append(link)
                    next.find('.card-img').attr('src',apiData.results[i]["image"])
                    next.hide()
                    
                    $("#loadpoint").append(next);
                    next.fadeIn();
                }

            })
        })

    }

    changePage = () => {
        // if already changing pages, abandon attempt
        if( changingPages == true ){
            return false
        }

        // otherwise let the world know we are about to try
        changingPages = true;
    }


    // REQUEST CALLS
    
    // list of accepted cuisines from api
    var cuisines = [
        "African",
        "American",
        "British",
        "Cajun",
        "Caribbean",
        "Chinese",
        "Eastern European",
        "European",
        "French",
        "German",
        "Greek",
        "Indian",
        "Irish",
        "Italian",
        "Japanese",
        "Jewish",
        "Korean",
        "Latin American",
        "Mediterranean",
        "Mexican",
        "Middle Eastern",
        "Nordic",
        "Southern",
        "Spanish",
        "Thai",
        "Vietnamese"
    ];


    request_favorites = () => {
        // this will make a request to the manetheren server
        // for a list of favorite recipes that I've cached
    }

    // random search
    request_random = () => {
        // gets a random recipe from the the actual API
    }

    request_search = (query, opts) => {
        // uses the actual API to look up a list of recipes

        var search_string = "?query="+query;

        // lets define the options we want to support


        // additional
        // default number of results
        var number = 10;
        // overload
        if("number" in opts){
            number = parseInt(opts["number"])
            if(isNaN(number)){
                number = 10;
            }
        }
        // set number search string
        search_string += "&number="+number;

        // default offset of search results
        var offset = 0;
        // overload
        if("offset" in opts){
            offset = parseInt(opts["offset"])
            if(isNaN(offset)){
                offset = 0;
            }
        }
        search_string += "&offset="+offset;

        // choose the ingredients to search for
        var includeIngredients = null;
        if( includeIngredients ){
            var ingredientList = "";
            for(var i=0; i<includeIngredients.length; i++){
                ingredientList+=includeIngredients[i];
                if( i < includeIngredients.length-1){
                    ingredientList+=",";
                }
            }
            search_string += "&includeIngredients="+ingredientList
        }

        // get recipe nutrition information as well 
        // (overload API default of false)
        var addRecipeNutrition = 'true';
        if("addRecipeNutrition" in opts){
            addRecipeNutrition = "addRecipeNutrition"
        }
        search_string += "&addRecipeNutrition="+addRecipeNutrition;

        var queryString = request_string(search_string)

    }

    shopping_list = () => {
        // uses the manetheren server to pull a list of 
        // things to buy at the grocery store
    }

    request_string = ( query ) => {
        var request_string = "https://api.spoonacular.com/recipes/complexSearch"+query+"&apiKey="+config["APIKEY"];
    }

});