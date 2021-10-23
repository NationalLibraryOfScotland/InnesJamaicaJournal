

	
// a generic attribution variable for NLS historic map tilesets
	
	var NLS_attribution = new ol.Attribution({
	  html: 'Historic background maps courtesy of the <a href="https://maps.nls.uk/">National Library of Scotland</a>' 
	});




// this is the maximum extent as W,S,E,N that the map will show to stop people moving away from Jamaica - increase or decrease as required

	var maxExtent =  [-8808172.312220978, 1899477.1386612295, -8397858.344386151, 2226016.1234955024];

	var stamentoner = new ol.layer.Tile({
		title: 'Background map - Today (21st century)',
	        source: new ol.source.Stamen({
				attributions: new ol.Attribution({
	  				html: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>, under <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="https://openstreetmap.org">OpenStreetMap</a>, under <a href="https://www.openstreetmap.org/copyright">ODbL</a>.'
					}),
	        		layer: 'toner'
	      })
	    });

// James Robertson's Jamaica map as a Tile layer

  var jamaica = new ol.layer.Tile({
        		preload: Infinity,
  	extent: ol.proj.transformExtent([-78.4711, 17.6095, -75.9799, 18.6501], 'EPSG:4326', 'EPSG:3857'),
	title: "Jamaica - James Robertson, 1804",
	source: new ol.source.XYZ({
				url: "https://mapseries-tilesets.s3.amazonaws.com/jamaica/{z}/{x}/{-y}.png",
				minZoom: 8,
				maxZoom: 15
		  }),
        numZoomLevels: 15,
        mosaic_id: '74428076',
        group_no: '63',
        typename: 'nls:WFS',
        key: 'geo.nls.uk/maps/nokey.html',
	keytext: "View the individual sheets of James Robertson's maps of Jamaica mapping by selecting 'Find by place' above",
	type: 'overlay', 
        visible: false,
        minx: -78.4711, 
        miny: 17.6095, 
        maxx: -75.9799, 
        maxy: 18.6501,
	maxZoom: 15,
        attribution: ''
    });


//  makes James Robertson's Jamaica map visible

	jamaica.setVisible(true);




           // Define styles for the circle markers

	   // the original red circles for the points

            var circle_symbol = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({
                        color: 'rgba(255,102,102, 0.8)',
                    }),
                    stroke: new ol.style.Stroke({
                       // color: 'rgba(21, 20, 60, 0.9)',
                       // width: 2

		      color: [0, 0, 0, 0.9],
		      width: 2,
		      lineDash: [2,4]

                    })


                })
            });


// a custom style for the circles, creating dotted line borders for those less certain locations with 'PLA_SPEC' = 'Yes'

		var customStyleFunction = function(feature, resolution) {
		
		
		  if(feature.get('PLA_SPEC') === 'Yes') {
		      strokeformat = new ol.style.Stroke({
		      color: [21, 20, 60, 0.9],
		      width: 2,
		      lineDash: [2,4]
                    });
		  } else  {
		     strokeformat = new ol.style.Stroke({
                       color: 'rgba(21, 20, 60, 0.9)',
                       width: 2
                    });
		  }
		
		  return [new ol.style.Style({
                     image: new ol.style.Circle({
                     radius: 8,
                     fill: new ol.style.Fill({
                        color: 'rgba(102,102,255, 0.4)',
                      }),
		      stroke: strokeformat
		    })
		  })];
		};

// an invisible style

	var invisible = new ol.style.Style({});

// the green circle selected style 

             var selectedStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 12,
                    fill: new ol.style.Fill({
                        color: '#98FB98'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.8)',
                        width: 3
                    })
                })
            });

// this is the layer definition for the main points GEOJSON file showing the locations of Alexander Innes

	    var circles = new ol.layer.Vector({
        	  preload: Infinity,
        	  visible: true,
		  source: new ol.source.Vector({
		   url: 'https://geo.nls.uk/maps/innes/scripts/innes-journal-1-sept.js',
    		    format: new ol.format.GeoJSON(),
		  }),
		    style: customStyleFunction,
		   // maxResolution: 305.748113140705
	    });

		selection_source = new ol.source.Vector({
//    		    format: new ol.format.GeoJSON(),
		  });


// this is a second invisible layer for Robertson's points

	    var selection = new ol.layer.Vector({
        	  preload: Infinity,
        	  visible: true,
		  source: new ol.source.Vector({
		   url: 'https://geo.nls.uk/maps/innes/scripts/innes-journal-1-sept.js',
    		    format: new ol.format.GeoJSON(),
		  }),
		    style: invisible,
		   // maxResolution: 305.748113140705
	    });


// the popup box that appears as an overlay if a place was visited more than once

	      var container = document.getElementById('popup');
	      var content = document.getElementById('popup-content');
	      var closer = document.getElementById('popup-closer');
	
	      var overlaylayer = new ol.Overlay(({
	        element: container,
	        autoPan: true,
	        autoPanAnimation: {
	          duration: 250
	        }
	      }));
	       
	      closer.onclick = function() {
	        overlaylayer.setPosition(undefined);
		document.getElementById('placenames').innerHTML = '';
		unselectPreviousFeatures();
	        closer.blur();
	        return false;
	      };


// this removes the default OpenLayers attribution for map layers

	      var attribution = new ol.control.Attribution({
	        collapsible: false
	      });


// the main ol map class

		var map = new ol.Map({
		  target: 'map',
		  renderer: 'canvas',
		  controls: ol.control.defaults({attribution: false}).extend([attribution, new ol.control.ScaleLine({ units:'metric' })]),
		  layers: [jamaica, circles, selection],
		  logo: false,
                  loadTilesWhileAnimating: true,
		  overlays: [overlaylayer],
		  view: new ol.View({
		    center: ol.proj.transform([-77.32, 18.09], 'EPSG:4326', 'EPSG:3857'),
		    zoom: 9,
		    extent: maxExtent,
		    minZoom: 8,
		    maxZoom: 14
		  })
		});


// this is the statement for the small overview map - can be removed by removing it from the map controls line below

		var overviewMapControl = new ol.control.OverviewMap({
		  // see in overviewmap-custom.html to see the custom CSS used
		  className: 'ol-overviewmap ol-custom-overviewmap',
		  layers: [jamaica ],
		  collapseLabel: '\u00AB',
		  label: '\u00AB',
		  collapsed: false
		});


// the featureOverlay for the selected vector features

            var selectedFeatures = [];

// Unselect previous selected features

	function unselectPreviousFeatures() {
                var i;
                for(i=0; i< selectedFeatures.length; i++) {
                    selectedFeatures[i].setStyle(null);
                }
                selectedFeatures = [];

		document.getElementById('placenames').innerHTML = '';

		selection_source = map.getLayers().getArray()[2].getSource();
		selection_source.forEachFeature( function(feature){
		                    feature.setStyle([
		                        invisible, 
		                    ]);
		});

		jQuery( "#leftpanel > div > div" ).css( "background-color", '' );

		if (overlaylayer.getPosition() !== undefined)

			{
	
		        overlaylayer.setPosition(undefined);
		        closer.blur();
		        return false;
	
			}

            }

// initiatives the date slider

	jQuery(document).ready(function(){

	    $( "#slider-range" ).slider({
	
	
		      range: false,
		      min: new Date('1823/12/18').getTime() / 1000,
		      max: new Date('1824/02/26').getTime() / 1000,
		      step: 86400,
		      value: new Date('1823/12/18').getTime() / 1000,

		      slide: function( event, ui ) {

		        $( "#date-text" ).val( new Date(ui.value * 1000).toDateString()  );
		      }
		    });
		    $( "#date-text" ).val(new Date($( "#slider-range" ).slider( "value") * 1000).toDateString());


	});



// function executed when the date slider stops sliding

	jQuery( "#slider-range" ).on( "slidestop", function( event, ui ) 

		{
			unselectPreviousFeatures();

	// split the date value into separate year, month and day

			date1 = jQuery( "#slider-range" ).slider( "value");
			date = date1.toString();
			var year = new Date([ date ] * 1000 ).getFullYear();
			var month = new Date( [  date ] * 1000 ).getMonth();
			var day = new Date( [ date ] * 1000 ).getDate();

	// edit the month and day to add leading zeros if less than 10

			var truemonth =  month + 1;

			if ( truemonth < 10 )
			    { monthofyear = "0" + truemonth; }
			else
			    { monthofyear =  truemonth; }

			if ( day < 10 )
			    { dayofmonth = "0" + day; }
			else
			    { dayofmonth =  day; }

			console.log( "dates: " + year + " " +  monthofyear + " " + dayofmonth );

	// combined date string is selectedYear

			var selectedFx = year.toString() + monthofyear + dayofmonth ;

			console.log( "selectedYear: " + selectedFx );


			var selectedFxHash = "#d" + year + monthofyear + dayofmonth ;

			console.log( "selectedFxHash: " + selectedFxHash );


	// find map features with selectedFx date and highlight them


			if ($(selectedFxHash).length > 0)

			{

			var source = map.getLayers().getArray()[2].getSource();
			source.forEachFeature( function(feature){
				if (feature.get('DATE_NUM') == selectedFx)
				    {
			                    feature.setStyle([
			                        selectedStyle, 
			                    ]);

					selectedFeatures.push(feature);

				    }
				});


					var placename_set = [];

		

			                var j;
			                for (j=0; j< selectedFeatures.length; j++) {

						placename_set.push(selectedFeatures[j].get('QUOTE_TRAN'));

			                }

					selectedFeaturesNoDuplicates = [];

					selectedFeaturesNoDuplicates = placename_set.filter(function(item, pos) {
					    return placename_set.indexOf(item) == pos;
					})

				
					console.log(selectedFeaturesNoDuplicates);

					var selectedFeaturesNoDuplicatesString = "";


			                for (i=0; i < selectedFeaturesNoDuplicates.length; i++) {
						if (selectedFeaturesNoDuplicates.length == 1) {
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i];
						}
						else
						{
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i] + ";&nbsp;";
						}

			                }

					selectedFeaturesNoDuplicatesString += "&nbsp;";

					console.log(selectedFeaturesNoDuplicatesString);

					selectedFeaturesNoDuplicatesString.replace(/,&nbsp;&nbsp;/g, /.&nbsp;/);

					document.getElementById('placenames').innerHTML = selectedFeaturesNoDuplicatesString;

	// scroll leftpanel to selected date and highlight it


				      jQuery('#leftpanel').animate({
				        scrollTop: $("#d0").offset().top
				      }, 0, function(){
				        // Add hash (#) to URL when done scrolling (default click behavior)
				        // window.location.hash = hash;
				      });



				      jQuery('#leftpanel').animate({
				        scrollTop: $(selectedFxHash).offset().top
				      }, 600, function(){
				        jQuery(selectedFxHash).children().css( "background-color", "#c7f0c7" );
				        // Add hash (#) to URL when done scrolling (default click behavior)
				        // window.location.hash = hash;
				      });

			}
				else

			{

		//  if the day does not exist in leftpanel change to the day earlier and run scrollleftpanel with day earlier.

				//		alert("This day does not exist in left panel");

			  			console.log( "selectedFx: " + selectedFx );
						newselectedFx = (parseInt(selectedFx) - 1);
			  			console.log( "newselectedFx: " + newselectedFx );

						var listidstring = newselectedFx.toString();
			
						year = listidstring.substring(0, 4);
						month = listidstring.substring(4, 6);
						day = listidstring.substring(6, 9);
			
						dateID = listidstring.substring(0, 9);
			
						newdate =  year + "/" + month + "/" + day;

			  			console.log( "newdate: " + newdate );

						$("#slider-range").slider('value', new Date(newdate).getTime() / 1000  );

						scrollleftpanel(newselectedFx);
			}





		} 

	);




// function executed when mouse enters leftpanel to select the resultslist div elements, and find features in the GeoJSON file based on their DATE_NUM

	jQuery( document ).ready(function() {
		jQuery("#leftpanel > div").on("mouseenter", function(event) {
			unselectPreviousFeatures();
			var listid = jQuery(this).data('layerid');



	// this line below ignores the resultslist div elements with dx or d0 at the top of the leftpanel

		if ((((listid == 'd0' ) || (listid == 'dx' )  || (listid == '' )  || (listid == null )))) {unselectPreviousFeatures(); return; }

			var listidstring = listid.toString();

			year = listidstring.substring(0, 4);
			month = listidstring.substring(4, 6);
			day = listidstring.substring(6, 9);

			new_month = month.replace(/^0+/, '');
			new_day = day.replace(/^0+/, '');

			dateID = listidstring.substring(0, 9);

			newdate =  year + "/" + new_month + "/" + new_day;

			dateIDnum = parseInt(dateID);



			var selectedFxHash = "#d" + listid;

			console.log( "selectedFxHash: " + selectedFxHash );

		// highlight the div under the cursor

			jQuery(selectedFxHash).children().css( "background-color", "#c7f0c7" );

		// mover the date slider to the selected day

   			$("#slider-range").slider('option','value', new Date(newdate).getTime() / 1000 );


		   	$( "#date-text" ).val(new Date($( "#slider-range" ).slider( "value" ) * 1000).toDateString());


		// select features in the selection layer (default invisible) and display them in green - the selectedStyle

			var source = map.getLayers().getArray()[2].getSource();
			// unselectPreviousFeatures(); 
			source.forEachFeature( function(feature){
				if (feature.get('DATE_NUM') === listid)
				    {
			                    feature.setStyle([
			                        selectedStyle, 
			                    ]);

					selectedFeatures.push(feature);
				    }
				});


					var placename_set = [];

		

			                var j;
			                for (j=0; j< selectedFeatures.length; j++) {

						placename_set.push(selectedFeatures[j].get('QUOTE_TRAN'));

			                }

					selectedFeaturesNoDuplicates = [];

					selectedFeaturesNoDuplicates = placename_set.filter(function(item, pos) {
					    return placename_set.indexOf(item) == pos;
					})

				
					console.log(selectedFeaturesNoDuplicates);

					var selectedFeaturesNoDuplicatesString = "";


			                for (i=0; i < selectedFeaturesNoDuplicates.length; i++) {
						if (selectedFeaturesNoDuplicates.length == 1) {
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i];
						}
						else
						{
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i] + ";&nbsp;";
						}

			                }

					selectedFeaturesNoDuplicatesString += "&nbsp;";

					console.log(selectedFeaturesNoDuplicatesString);

					selectedFeaturesNoDuplicatesString.replace(/,&nbsp;&nbsp;/g, /.&nbsp;/);

					document.getElementById('placenames').innerHTML = selectedFeaturesNoDuplicatesString;

			});

		// unselect features when mouse leaves leftpanel


		jQuery("#leftpanel > div").on("mouseleave", function(event) {
			unselectPreviousFeatures(); 
		});  

	});



// function to fly to a particular feature - not yet implemented

		var zoom = 16;


	      function flyTo(location, done) {
	        var duration = 4000;
	      //  var zoom = map.getView().getZoom();
	        var parts = 2;
	        var called = false;
	        function callback(complete) {
	          --parts;
	          if (called) {
	            return;
	          }
	          if (parts === 0 || !complete) {
	            called = true;
	            done(complete);
	          }
	        }
	        map.getView().animate({
	          center: location,
	          duration: duration
	        }, callback);
	        map.getView().animate({
	          zoom: zoom - 3,
	          duration: duration / 2
	        }, {
	          zoom: zoom,
	          duration: duration / 2
	        }, callback);
	      }



// function to scroll the leftpanel to select the resultslist div element selectedFx, and find features in the GeoJSON file based on their DATE_NUM



	function scrollleftpanel(selectedFx)

		{

			unselectPreviousFeatures(); 

			var selectedFxHash = "#d" + selectedFx;
	
			console.log( "selectedFxHash: " + selectedFxHash );


			if ($(selectedFxHash).length > 0)

				{

	//  these lines below move the dateslider to the new date

				var listidstring = selectedFx.toString();
				year = listidstring.substring(0, 4);
				month = listidstring.substring(4, 6);
				day = listidstring.substring(6, 9);
				dateID = listidstring.substring(0, 9);
				newdate =  year + "/" + month + "/" + day ;

	   			$("#slider-range").slider('option','value', new Date(newdate).getTime() / 1000 );
	
			   	$( "#date-text" ).val(new Date($( "#slider-range" ).slider( "value") * 1000).toDateString());
	
	//			alert ( "listid: " + listid);

	
				jQuery(selectedFxHash).children().css( "background-color", "#c7f0c7" );

	// these lines below find map features in the GeoJSON file and highlight them

				var source = map.getLayers().getArray()[2].getSource();
				// unselectPreviousFeatures(); 
				source.forEachFeature( function(feature){
					if (feature.get('DATE_NUM') === selectedFx)
					    {
				                    feature.setStyle([
				                        selectedStyle, 
				                    ]);

					       selectedFeatures.push(feature);
					    }
					});

					var placename_set = [];

		

			                var j;
			                for (j=0; j< selectedFeatures.length; j++) {

						placename_set.push(selectedFeatures[j].get('QUOTE_TRAN'));

			                }

					selectedFeaturesNoDuplicates = [];

					selectedFeaturesNoDuplicates = placename_set.filter(function(item, pos) {
					    return placename_set.indexOf(item) == pos;
					})

				
					console.log(selectedFeaturesNoDuplicates);

					var selectedFeaturesNoDuplicatesString = "";

			                for (i=0; i < selectedFeaturesNoDuplicates.length; i++) {
						if (selectedFeaturesNoDuplicates.length == 1) {
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i];
						}
						else
						{
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i] + ";&nbsp;";
						}

			                }

						selectedFeaturesNoDuplicatesString += "&nbsp;";

					console.log(selectedFeaturesNoDuplicatesString);

					selectedFeaturesNoDuplicatesString.replace(/,&nbsp;&nbsp;/g, /.&nbsp;/);

					document.getElementById('placenames').innerHTML = selectedFeaturesNoDuplicatesString;
	
	// these lines below scroll the leftpanel to the selected day 
	
	
		
				jQuery('#leftpanel').animate({
					scrollTop: $("#d0").offset().top
					}, 0, function(){
					// Add hash (#) to URL when done scrolling (default click behavior)
					// window.location.hash = hash;
				 });
		
				jQuery('#leftpanel').animate({
					scrollTop: $(selectedFxHash).offset().top
					}, 600, function(){
		//			jQuery(selectedFxHash).children().css( "background-color", "#98FB98" );
					// Add hash (#) to URL when done scrolling (default click behavior)
					// window.location.hash = hash;
				});

				}
			else
				{

		//  if the day does not exist in leftpanel change to the day earlier and run again.

		//				alert("This day does not exist in left panel");

		jQuery("#daymessage").show();
		document.getElementById('daymessage').innerHTML = "No entry for this particular day in the Journal -<br/>Reverting to the previous earlier day with a Journal entry."; 
		setTimeout( function(){
			document.getElementById("daymessage").innerHTML = "";
			jQuery("#daymessage").hide();

		}, 8000); // delay 1000 ms

			  			console.log( "selectedFx: " + selectedFx );
						newselectedFx = (parseInt(selectedFx) - 1);
			  			console.log( "newselectedFx: " + newselectedFx );

						var listidstring = newselectedFx.toString();
			
						year = listidstring.substring(0, 4);
						month = listidstring.substring(4, 6);
						day = listidstring.substring(6, 9);
			
						dateID = listidstring.substring(0, 9);
			
						newdate = year + "." + month + "." + day;

			  			console.log( "newdate: " + newdate );

	   					$("#slider-range").slider('option','value', new Date(newdate).getTime() / 1000 );

			   			$( "#date-text" ).val(new Date($( "#slider-range" ).slider( "value") * 1000).toDateString());

						scrollleftpanel(newselectedFx);
				}

		}



function eliminateDuplicates(arr) {
  var i,
      len = arr.length,
      out = [],
      obj = {};

  for (i = 0; i < len; i++) {
    obj[arr[i]] = 0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out;
}

// function executed on map click to select features on map and highlight them in the leftpanel


	map.on('click', function(event) {

  	unselectPreviousFeatures(); 

  //		if (selectedFeatures.length > 0 )

		                map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
		                    feature.setStyle([
		                        selectedStyle, 
		                    ]);
		                   selectedFeatures.push(feature);
				// return feature;

			 }, null, function(layer) {

 			return layer == map.getLayers().getArray()[2];

			});


			if (selectedFeatures.length == 1)  {

		  		var selectedFx = selectedFeatures[0].get('DATE_NUM');

				if (selectedFx !== '')

					{

		  		        var placename = selectedFeatures[0].get('QUOTE_TRAN');

					if (placename !== '')  {
							document.getElementById('placenames').innerHTML =  placename;
								}

			  		var selectedFxHash = "#d" + selectedFx;


					if ($(selectedFxHash).length > 0)

						{


					//  these lines below move the dateslider to the new date

							var listidstring = selectedFx.toString();
							year = listidstring.substring(0, 4);
							month = listidstring.substring(4, 6);
							day = listidstring.substring(6, 9);
							dateID = listidstring.substring(0, 9);
							newdate = year + "/" + month + "/" + day;
			
				   			$("#slider-range").slider('option','value', new Date(newdate).getTime() / 1000 );
				
						   	$( "#date-text" ).val(new Date($( "#slider-range" ).slider( "value" ) * 1000).toDateString());

							jQuery(selectedFxHash).children().css( "background-color", "#c7f0c7" );
	
							console.log( "selectedFxHash: " + selectedFxHash );

					// these lines below scroll the leftpanel to the selected day
		
						      jQuery('#leftpanel').animate({
						        scrollTop: $("#d0").offset().top
						      }, 0, function(){
						        // Add hash (#) to URL when done scrolling (default click behavior)
						        // window.location.hash = hash;
						      });
		
		
		
						      jQuery('#leftpanel').animate({
						        scrollTop: $(selectedFxHash).offset().top
						      }, 600, function(){
		//				        jQuery(selectedFxHash).children().css( "background-color", "#c7f0c7" );
						        // Add hash (#) to URL when done scrolling (default click behavior)
						        // window.location.hash = hash;
						      });

						}

					else

						{
							alert("This day does not exist in left panel");
						}

					}
					
				}

		// if there is more than one feature at this location bring up pop-up box

				else if (selectedFeatures.length > 1)

				{

				coordinates = [];
				coordinates = selectedFeatures[0].getGeometry().getCoordinates();



				selectedFeatures.sort(function(a, b){
					   var nameA=a.get('DATE_NUM'), nameB=b.get('DATE_NUM')
					   if (nameA < nameB) //sort string ascending
					       return -1 
					   if (nameA > nameB)
					       return 1
					   return 0 //default return value (no sorting)
			
					})


					var placename_set = [];

		

			                var j;
			                for (j=0; j< selectedFeatures.length; j++) {

						placename_set.push(selectedFeatures[j].get('QUOTE_TRAN'));

			                }

					selectedFeaturesNoDuplicates = [];

					selectedFeaturesNoDuplicates = placename_set.filter(function(item, pos) {
					    return placename_set.indexOf(item) == pos;
					})

				
					console.log(selectedFeaturesNoDuplicates);

					var selectedFeaturesNoDuplicatesString = "";

			                for (i=0; i < selectedFeaturesNoDuplicates.length; i++) {
						if (selectedFeaturesNoDuplicates.length == 1) {
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i];
						}
						else
						{
						selectedFeaturesNoDuplicatesString += selectedFeaturesNoDuplicates[i] + ";&nbsp;";
						}

			                }

					selectedFeaturesNoDuplicatesString += "&nbsp;"

					console.log(selectedFeaturesNoDuplicatesString);

					selectedFeaturesNoDuplicatesString.replace(/,&nbsp;&nbsp;/g, /.&nbsp;/);

					document.getElementById('placenames').innerHTML = selectedFeaturesNoDuplicatesString;



				var results = "";

//				results += '<div id = "popup-content" >';

				results += '<p>Please choose a particular day that Alexander Innes visited <strong>' + selectedFeatures[0].get('QUOTE_TRAN') + '</strong>:</p>'  ;

				results += '<table>';

			                var i;
			                for(i=0; i< selectedFeatures.length; i++) {
			                    selectedFeatures[i].setStyle(null);
						results += '<tr><td><a href="javascript:scrollleftpanel(' + selectedFeatures[i].get('DATE_NUM') + ');">' + selectedFeatures[i].get('DATE_TXT') + '</a></td></tr>';

		                    	    selectedFeatures[i].setStyle([selectedStyle]);
			                }

				results += '</table>';

		        	content.innerHTML = results;
		// alert(content.innerHTML);
		        	overlaylayer.setPosition(coordinates);

				}

	});


	// change cursor to pointer whilst hovering over features

		var cursorHoverStyle = "pointer";
		var target = map.getTarget();
		
		//target returned might be the DOM element or the ID of this element dependeing on how the map was initialized
		//either way get a jQuery object for it
		var jTarget = typeof target === "string" ? jQuery("#"+target) : jQuery(target);
		
		map.on("pointermove", function (event) {
		    var mouseCoordInMapPixels = [event.originalEvent.offsetX, event.originalEvent.offsetY];
		
		    //detect feature at mouse coords
		    var hit = map.forEachFeatureAtPixel(mouseCoordInMapPixels, function (feature, layer) {
		        return true;
		    });
		
		    if (hit) {
		        jTarget.css("cursor", cursorHoverStyle);
		    } else {
		        jTarget.css("cursor", "");
		    }
		});




