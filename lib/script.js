/*

	BUILD NAME: DVC174 JMAP: Population data by Parliamentary Constituencies
	----------


	NAME: JMAP
	----
		  
		  
	DESCRIPTION:
	-----------
	- JMAP is an interactive application that allows a user to select, map and interrogate a range of provided predefined datasets. This is a direct replacement for older mapping tools created by DVC in deprecated and unsupported Adobe Flash technology
	- It can hold and display up to 16 datasets
	- JMAP provides the ability to view time-series or single-year datasets, and allows the user to review detailing metadata information, link specific map viewers to others via email, Facebook or Twitter.
	- The application also provides users the means to adapt the display to suit their needs, providing means to alter the display opacity, colour palette used, number of data divisions and means to divide the data to suit their needs.
	- JMAP allows the user to split data into 2 to 8 divisions, using either 'Equal Intervals', 'Natural Jenks' or 'Quantiles' data splitting algorithms. I can also handle geographic areas that are represented with 'null' values. 
	- The main data choropleth map is supported by time-series, geography unit ranking and data variable details graphs, depending on the style of data provided (i.e. a 'Variable Details' graph is provided if 2 or more data sets ar provided;
	a 'Time-series' graph is provided if datasets of more than 1-time unit are provided.
	- A simple graphical legend is also provided, and provides further information to support the graphical and mapping areas. The user is able to interact with all three data information areas (map, graphs and legend),
	thus affecting automated dynamic changes to the other two data areas. Typically these changes are exhibited by relevant data bands (on the legend) geography unit bars (on the ranking graph), data bars (on the 'Details' graph),
	the geography unit's specific time-series line or geographic area polygon being highlighted by the complementary colour to the data highlight colour
	- User's can further interact with this tool by selected a specific geographic unit form the pre-loaded selection list found on the main user interface, or by entering an address/postcode element in the geosearch tool to affect a point-in-polygon procedure. 
	In each instance, the selected geographic unit is highlighted.
	- Each graph type may also relate a selected geographic area's own data values to the national/geographic extent mean/trend line also (if relevant data is available).	
	
		 
		  
	DATE CREATED: April 2013 to March 2014
	CREATOR(S): JAMES BAYLISS; ROB FRY
	TECHNOLOGIES: HTML5, CSS3, Leaflet, Javascript, JQuery, D3, 
	REQUIRED SUPPORT FILES:
							colorbrewer.js
							*config.js - main parameterisation file for setting defaults
							d3.v3.min.js
							*data.js - main data file containing (a) customer data variables and (b) boundry vector ionformation in geoJson formt; need to be constructed using 'data.xls' received from customers, 'extractjson.sas' and 'createjson.sas'
							jquery-1.8.3.js
							jquery-1.9.1.js
							jquery.ui.touch-punch.min.js
							jquery-ui.css
							jquery-ui.js
							jquery-ui-1.9.2.custom.min.css
							jquery-ui-1.9.2.custom.min.js
							jquery-url-shortener.js
							l.control.geosearch.js
							l.geosearch.css
							l.geosearch.provider.js
							l.geosearch.provider.google.js
							leaflet.css
							leaflet.js
							leaflet-hash.js
							leaflet-pip.js
							leaflet-src.js
							modernizr.js
							**script.js - application-specific JavaScript/JQuery/D3/Leaflet code
							ss.js
							**style.css - application-specific CSS attribution
							
														
							* - files requiring modification to build a new version of JMAP against new data and/or boundary
							** - other main JMAP-specific files	
							
							
	minified using: http://jscompress.com/				
							
							
*/				
					
			// Declaration of global variables ...			
			var selectedGEOUNITVariables = new Array(); // 1-D array to store data values specific to SelectedYearIndex and SelectedDatasetIndex for individual GEOUNIT hovered over
			var fixedDataRanges = new Array(); // initialised array for storing data division values for dataset/year combination currently depeicted when user checks 'Fix data ranges" check box
			var testRangeCounts = new Array();
			var geomStrArray = new Array(); // 1-D array to store content of "features.properties.geometry.coordinates" component for selected individual GEOUNIT. Stored as given verbatim in 'data.js'
			var latlngsArray = new Array(); // Similar to 'geomStrArray'. 1-D array to store content of "features.properties.geometry.coordinates" component for selected individual GEOUNIT. Stored as given verbatim in 'data.js'
			var markedPolys = new Array(); // 1-D array to store GeoJSON feature polygons for each GEOUNIT that falls within grade/diovision range in selected by user in simplelegend; access to highlight all geography areas at once
			var RangeCounts = new Array(); // 1-D array to store numeric counts for number of GEOUNITs present in each grade/division range
			var GEOUNIT_Code = new Array(); // 1-D array to store GEOUNIT_CDs in order as listed in data.js. Required to allow interaction and value return from Ranking graph
			var GEOUNIT_Name = new Array(); // 1-D array to store GEOUNIT_NMs in order as listed in data.js. Required to allow interaction and value return from Ranking graph 
			var divisions = new Array(); // 1-D array to store values used to split input data into required bands. Values are dependent upon split mechanism (Quantiles, Equal Interval, Nat. Jenks) and number of divisions (numColorDivs)
			var markers = new Array(); // Also used in 'L.Control.GeoSearch.js'. 1-D array used to store  icon 'marker(s)' to highlight selected polygon/location via geosearch control
			var point = new Array(); // 1-D array to contain (lat, lon) array of point located using geosearch control	
			var color = new Array(); // 1-D interim array to store content retrieved from 'colorbrewer.js'
			var needToRecalculateNumberInGrps = true; // defines if there is a need to recalculate the number of GEOUNITs present in each grade/division range. Required if user changes dataset, number of divisions, data split
			var highlightedGEOUNIT = false; // Boolean variable to instruct if an individual GEOUNIT has been selected either using mouse-click, selection list drop-down or via geosearch control			
			var previousSelection = false; // simple boolean variable for IE browser handling - has user hovered over the map and then exited mouse across the coast?
			var rankMouseOver = false; // has user hovered over the ranking graph?
			var customCheck = false; 
			var hasHovered = false; // Boolean variable to instruct specific code to action/not action if any GEOUNIT has/has not been hovered over by user.
			var nullValue = false; // Boolean flag to indicate presence of null/ubndefined values in 'data.js' Affects how content of legend is built (i.e. is grey 'No Data' bars are presented at base of legend)			
			var highfirst = true; // NEW VARIABLE TO DENOTE WHETHER THIS IS THE FIRST TIME YOU'VE HIGHLIGHTED OR NOT (USED IN FUCNTION HIGHLIGHTFEATURE())
			var baseLayer = true; // define if background base tiles are shown	
			var previous = false; // contains object variable for IE browser handling - has user hovered over the map and then exited mouse across the coast?		
			var globalMax = null; // holds absolute MAXIMUM value contained in data.js, regardless of which dataset, year or GEOUNIT it occurs in
			var globalMin = null; // holds absolute MINIMUM value contained in data.js, regardless of which dataset, year or GEOUNIT it occurs in
			var evented = null; // holds 'object' of GEOUNIT. Equivalent to 'e[.target]' argument to 'zoomToFeature', 'selectFeature', 'onEachFeature' functions
			var indexOfCurrentHoverOverGEOUNIT_CD = ''; // index value of selected GEOUNIT_CD as contained in data.js/GEOUNIT_Code 1-D arrays
			var indexOfCurrentHoverOverGEOUNIT_NM = ''; // index value of selected GEOUNIT_NM as contained in data.js/GEOUNIT_Name 1-D arrays	
			var currentHoverOverGEOUNIT_CD = ''; // absolute value of selected GEOUNIT_CD as contained in data.js/GEOUNIT_Code 1-D arrays
			var currentHoverOverGEOUNIT_NM = ''; //  value of selected GEOUNIT_NM as contained in data.js/GEOUNIT_Name 1-D arrays	
			var layerReference = ''; // holds  content of '.features.properties' from 'data.js.
			var selectedColor = ''; // final selected colour from 'colorbrewer.js' used to highlight relevant GEOUNITs, legend or graphing elements
			var metadataStr = ''; // text string updated with content from 'metadata array (held in 'config.js') as user switches data set to display using 'dv-drop'
			var graphType = ''; // which of the three graph types (time-series, rank, detail) is selected in dv-drop by user
			var tilelayer = '';				
			var geomType = ''; // defines the geomtery type (polygon or multipolygon) of the JSON feature polygon selected by the user via map/geoUnit-drop [selection list]/geosearch control
			var colors = ''; // interim text string to contain verbatim content from 'colorbrewer.js' based on 'palette' (from 'color-drop' on Display controls dialog) and 'numColorDivs (in config.js) 
			var hoveredGrade = -1; // defined the grade inwhich the GEOUNIT falls on the specific occasion user mouseover's a GEOUNIT on the map
			var layer_count = 0; // incremental variable used with 'point-in-polygon' process to determine GEOUNIT selected by user entering location in 'leaflet-control-geosearch-qry'. Also referenced in 'leaflet-pip.js'
			var numElements = 0; // total number of GEOUNIT features contained in 'data.js'
			var selectedDatasetIndex; // index in array 'drop' of dataset selected by user on 'dv-drop' 
			var subDataArrayLength; // Number of elements (i.e. number of individual years) to each data variable array 
			var glblHghlghtBarHgt; // contains and sets physical height of vertical transparent bars covering ranking graph. Needed to highlight selected GEOUNITs to rank graph after user interaction with  legend in 'updateSimpleGraph()'. Value set in 'drawTimeSeries()'
			var glblHghlghtBarTop; // contains and sets physical top position of vertical transparent bars covering ranking graph. Needed to highlight selected GEOUNITs to rank graph after user interaction with  legend in 'updateSimpleGraph()'. Value set in 'drawTimeSeries()'
			var selectedYearIndex; // index of year selected by user on timeslider (equivalent to index through 'subDataArrayLength')
			var NumberOfDataSets; // Number of data variables provided to use
			var selectedDataset; // datasert selected by user as given on 'dv-drop' selection list
			var myDisplayDelay; // contains Timeout delay functionality for time slider iteration			
			var fixedValCheck; // global variable to denote current state of 'Fix data ranges" check box
			var selectedYear; // year selected via time slider
			var unitPolygon; // new single geoJSON polygon object created in 'fixHighlightPoly()' to draw highlighted over main map boundary layer
			var statsdata2; // text string to contain iframe HTML code for user to embed into emails
			var compColour; // extracted value for complamentrary colour to use as highlight on map, legend and graph. extracted from 'colorbrewer.js'
			var firstbit; // text string extracted from address bar ... 
			var rankingX; // contains X co-ordinate in viewbox to dynamically move ranking label with vertical highlighted bar in rank graph
			var timeSpan; // text string to be built from given start year (config.js) and end year (config.js; if provided)
			var geojson; // main geojson layer used to draw main boundary layer
			var layer; // variable set to provide underlying tiles to mapping area; also define individual hihglighting polygon where a GEOUNIT has been selected
			var opcty; // sets opacity of map/legend/graph elements from 'Display Controls' dialog
			var view; // used to center map on predefined (lat, long) coordinates and on clearing GEOUNIT slection
			var map; // contains the main Leaflet map object			
			
			
			//then, onload, check to see if the web browser can handle 'inline svg'
			if (Modernizr.inlinesvg)
			{
							
				
				// And here's the full-fat code for everyone else		
				// function call to delay displaying opening screen until all data in 'data.js' has loaded			
				loadDelay();
				
				
			}
			else
			{
				
				
				$('#main-wrapper').show();
				$('#ieMsg').show();							
				
				
				//browser can't handle inline svg, so display alternative content
				//in this example, load the config file to get the links to underlying datasets
				$("#dataLoadingGif").hide();
				
  
			}
			
			
			
			// FUNCTIONS ...				
			
		
				
			/*
				NAME: 			loadDisplay
				DESCRIPTION: 	display initial loaded display using initialisation parameters from config.js
				CALLED FROM:	loadDelay
				CALLS: 			getParams
								document.ready()
								stuffArrays
								drawUI
								getInitialSettings
								geo
								updateSimpleGraph									
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/			
			function loadDisplay()
			{					
				$("#loading").hide();
				clearTimeout(myDisplayDelay);
				
				$("#content").show();
				$("#main-wrapper").show();
				
				$.shortenUrl.settings.login = 'onsdatavis';
				$.shortenUrl.settings.apiKey = 'R_1edff3706d696ed7435ba5f60f6d0d40';
				
				getParams();
				
				
				if ( baseLayer == true )
				{
					tilelayer = new L.StamenTileLayer("toner-lite");
					map = new L.Map("map");				
					view = new L.LatLng(centerLat, centerLong);
					map.setView(view, zoom).addLayer(tilelayer);
				}
				else
				{
					map = new L.Map("map");				
					view = new L.LatLng(centerLat, centerLong);
					map.setView(view, zoom);					
				}
										
				new L.Control.GeoSearch({ provider: new L.GeoSearch.Provider.Google() }).addTo(map);
				
					
				// Enable Hash code - changes URL on movement of map (needs extending to reflect variable choices)
				var hash = new L.Hash(map);	
						

/*				
							NAME: 			$(document).ready
							DESCRIPTION: 	initialisation function  containing all functions to fire at startup; to load configuration variables to display default data  
							CALLED FROM:	n/a
							CALLS: 			stuffArrays
											drawUI
											getInitialSettings
											updateSimpleGraph
											geo
											updateSimpleGraph
											urli
											reint
							RETURNS: 		n/a
				
*/
				$(document).ready(function()
				{	
					stuffArrays();					
					drawUI();
					getInitialSettings();
					updateSimpleGraph(selectedDataset);
					geo(selectedDataset);
					updateSimpleGraph(selectedDataset);
										
					hash = new L.Hash(map);		
					
					urli();
					reint();
					
//					if ( subDataArrayLength == 1 )
//					{
//						document.getElementById('currentYear').innerHTML = singleYearDatasetsYears[selectedDatasetIndex];
//						$('#range-drop').attr("disabled", true); 
//						
//					}
//					else { document.getElementById('currentYear').innerHTML = startYear; }


					
					if ( subDataArrayLength == 1 )
					{
						
						if ( selectedDatasetIndex == 1 )
						{
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "340px" );
							
							$("#currentYearBg").css( "top", "115" );
							$("#currentYearBg").css( "left", "330px" );
							$("#currentYearBg").css( "width", "200px" );
						}
						
						else if ( selectedDatasetIndex == 4 )
						{
//							$("#currentYear").css( "font-size", "11px" );
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "255px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "245px" );
							$("#currentYearBg").css( "width", "280px" );
						}							
						else
						{
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "465px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "455px" );
							$("#currentYearBg").css( "width", "65px" );
						}
						
						document.getElementById('currentYear').innerHTML = singleYearDatasetsYears[selectedDatasetIndex];
						$('#range-drop').attr("disabled", true); 
						
					}
					else {
						
						if ( selectedDatasetIndex == 1 )
						{
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "340px" );
							
							$("#currentYearBg").css( "top", "115" );
							$("#currentYearBg").css( "left", "330px" );
							$("#currentYearBg").css( "width", "200px" );
						}
						
						else if ( selectedDatasetIndex == 4 )
						{
//							$("#currentYear").css( "font-size", "11px" );
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "255px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "245px" );
							$("#currentYearBg").css( "width", "280px" );
						}							
						else
						{
//							$("#currentYear").css( "font-size", "56px" );
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "465px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "455px" );
							$("#currentYearBg").css( "width", "65px" );	

						}
						document.getElementById('currentYear').innerHTML = startYear;
					}
					
					$('#embedbox').hide();	
					$('#infobox').hide();				
				});	
			  
			}// end loadDisplay()				
			
		
		
			/*
				NAME: 			loadDelay
				DESCRIPTION: 	delays displaying of initial screen configuration while data loads. Formats time span for title(s) 
				CALLED FROM:	global script
				CALLS: 			loadDisplay		
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function loadDelay()
			{	
			
			
				// check if datasets represent (a) single-year datasets or (b) time-series
				if ( (endYear-startYear)/yearInterval == 0 ) { timeSpan = singleYearDatasetsYears[0]; }
				else { timeSpan = startYear.toFixed(0) + "-" + endYear.toFixed(0); }
				
								
				$("#loading").show();
				
				
				// Update titles on interim banner of 'data loading' screen
				document.getElementById('bannerTitleTemp').innerHTML = Title[0];
//				document.getElementById('bannerSubTitleTemp').innerHTML = timeSpan + ", " + geoUnits + ", in " + geoCoverage;	
				document.getElementById('bannerSubTitleTemp').innerHTML = singleYearDatasetsYears[selectedDatasetIndex] + ", " + geoUnits + ", in " + geoCoverage;			
				document.getElementById('innerTabTitle').innerHTML = innerTabTitle;
				
				
				// set delay for loading.gif to be visible
				myDisplayDelay = setTimeout(function(){			
					loadDisplay();
				},750);
				
				
			}//end loadDelay()
						
			
				
			/*
				NAME: 			drawUI
				DESCRIPTION: 	draws all components to user interface and dialogs on load of application
				CALLED FROM:	$(document).ready
				CALLS: 			redrawUI
								urli
								addGraphdropElement	
								menuGeoUnit
								menuDataVariable
								menuGraphType							
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function drawUI()
			{
				
				
				// initialise variables
				var myTimerInterval;
				played = 'yes';
				
				
				// Display controls Div dialog declared here
				$("#dialogDisplayControls").dialog();
				
				
				// function entered if user interacts with play/pause buttons
				$('#PlayPauseBtn').click(function()
				{
					
					
					// if play button is pressed, changing display from static view to automated dynamic cyclic view
					if( played=='yes' )
					{
						
						// redefine variable
						played='no';
						
						
						// change button image, hide 'Clear' button components if present, disable selection lists to top-right of main display
						$('#PlayPauseBtn').css('background', "transparent url('./lib/images/pauselarge.png') center top no-repeat");						 
						$( "#clearBtn_ts" ).css( "display", "none" );
						$( "#clearBtn_sy" ).css( "display", "none" );
						$( "#clearBg" ).css( "display", "none" );
						document.getElementById( "dv-drop" ).disabled = true;
						document.getElementById( "geoUnit-drop" ).disabled = true;
						document.getElementById( "graph-drop" ).disabled = true;
						document.getElementById( "boundaries" ).disabled = true;
						document.getElementById( "fixedRanges" ).disabled = true;
						
						
						// enter main time interval fucntion
						myTimerInterval = setInterval(function()
						{						
							
							//get and store value of time slider
							var year = $( "#timeSlider" ).slider( "value" );
									
							
							// if time slider handle is NOT at largest/final value
							if ( year < $( "#timeSlider" ).slider("option",  "max" ) )
							{
								
								
								// iuncrement by one value
								$( "#timeSlider" ).slider( "value", (year + yearInterval ) );
							}
							
							
							// time slider handle is at maximum value
							else
							{	
							
							
								// if 'loop' is unchecked ...
								if ( document.getElementById('loop').checked == false )
								{
									
									
									// stop processing
									clearInterval(myTimerInterval);
									$( "#PlayPauseBtn" ).button( "option", "label", "Play" );
								}
								
								
								// else 'loop' has been selected by user
								else
								{
									
									
									//return slider handle to beginning
									$( "#timeSlider" ).slider( "value", $( "#timeSlider" ).slider("option",  "min" ) );
								}
							}
																
						},1250);	 // set this to change size of slider interval				
									 
					}
					
					// enter if 'play' = 'no'
					else
					{
						
						
						// rest button variable and clear timer interval
						played='yes';						
						$('#PlayPauseBtn').css('background', "transparent url('./lib/images/playlarge.png') center top no-repeat");							
						clearInterval(myTimerInterval);
						
						
						// enable all seldection lists on main application window
						document.getElementById( "dv-drop" ).disabled = false;
						document.getElementById( "geoUnit-drop" ).disabled = false;
						document.getElementById( "graph-drop" ).disabled = false;
						document.getElementById( "boundaries" ).disabled = false;
						document.getElementById( "fixedRanges" ).disabled = false;
	
		
						// only redisplay clear button and background if a GEOUNIT has been fixed upon at point of pressing play button
						if ( highlightedGEOUNIT == true )
						{		
			
							// redisplay clear button and background
							if ( subDataArrayLength > 1 ) { $( "#clearBtn_ts" ).show(); $( "#clearBg" ).show(); }
							else { $( "#clearBtn_sy" ).show(); $( "#clearBg" ).show(); }	
						}
							
					}
				});
			
			
				// append display components to 'Display Controls' dialog
				var buffer = "<br><br>";	
				$("<br>").appendTo("#dialogDisplayControls");


				// append, define and populate selection list for 'number of division' options				
				var para5=$("<p>").appendTo("#dialogDisplayControls");		
				$(para5).attr("id", "paraGroups").html("Number and style of data groups"); // selection list header label
				var sel10=$("<select>").appendTo("#dialogDisplayControls");
				$(divisionNumber).each(function(){ // populate selection list
					sel10.append($("<option>")
					.attr("value", this)
					.attr("class", 'selectElement')
					.text(this));
				});
				$(sel10).attr("id", "divisions-drop").change(function() { /* reint(); */ grabFixedDataDivisions('div'); }); // defined functions to fire if list is interacted with
				$("#divisions-drop").val('5'); // Define default starting value	for selection list
				
				
				// append, define and populate selection list for 'data split' division options
				var sel2=$("<select>").appendTo("#dialogDisplayControls");
				$(splittype).each(function(){ // populate selection list
					sel2.append($("<option>")
					.attr("value", this)
					.attr("class", 'selectElement')
					.text(this));
				});
				$(sel2).attr("id", "split-drop").change(function(){ /* reint(); */ grabFixedDataDivisions('sp'); }); // defined functions to fire if list is interacted with		
				$("#split-drop").val('Natural Jenks'); // Define default starting value	for selection list
				
				
				// append, define and populate selection list for 'color pallette' options
				var para6=$("<p>").appendTo("#dialogDisplayControls");		
				$(para6).attr("id", "paraPalette").html("Colour palette"); // selection list header label					
				var sel1=$("<select>").appendTo("#dialogDisplayControls");
				$(colours).each(function(){ // populate selection list
					sel1.append($("<option>")
					.attr("value", this)
					.attr("class", 'selectElement')
					.text(this));
				});
				$(sel1).attr("id", "color-drop").change(function() { reint(); }); // defined functions to fire if list is interacted with		
				$("#color-drop").val(onLoadPalette); // Define default starting value	for selection list
				
				
				// append, define and populate selection list for 'data range limits' options
				var para8=$("<p>").appendTo("#dialogDisplayControls");		
				$(para8).attr("id", "paraLimits").html("Data limits from"); // selection list header label					
				var sel8=$("<select>").appendTo("#dialogDisplayControls");
				$(datalimits).each(function(){// populate selection list
					sel8.append($("<option>")
					.attr("value", this)
					.attr("class", 'selectElement')
					.text(this));
				});
				$(sel8).attr("id", "range-drop").change(function() { 
				
					if ( $("#range-drop").val() == 'Within year' )
					{
						$( "#fixedRangesLabel" ).css( "display", "inline" );
						$( "#fixedRanges" ).css( "display", "inline" );

						$( "#fixedRanges" ).css( "checked", "false" );	
						$( "#fixedRanges" ).css( "disabled", "false" );
					}
					else
					{
						$( "#fixedRangesLabel" ).css( "display", "none" );
						$( "#fixedRanges" ).css( "display", "none" );						
					}
				
					reint();
					});// defined functions to fire if list is interacted with					
				$("#range-drop").val('Within year'); // Define default starting value
				$('#range-drop').attr("disabled", true); 	
				
				var para7=$("<p>").appendTo("#dialogDisplayControls");		
				$(para7).attr("id", "paraOpacity").html("Opacity");
				
				
				/* declaring and initializing of opacity slider ... to be held and used by 'dialogDisplayControls' ... */					
				/* removing this code allows application to load, but no opacity slider appeArs on 'display dialog'	*/								
				var para7=$("<p>").appendTo("#dialogDisplayControls");		
				$(para7).attr("id", "paraOpacity").html("Opacity");
				var slider1=$("<div>").appendTo("#dialogDisplayControls");
				$(slider1).attr("id", "opacitySlider")// initialize slider
					.attr("min", 0.01)	
					.attr("max", 1.00)	
					.attr("value", 0.66)	 // Define default starting value
					.attr("step", 0.01)	
					.attr("animate", true)
					.change(function(event, ui) // actioned if slider handle is moved
					{ 
					
					
						// update global opacity value
						opcty = $(event.target).slider("value");						
						
						
						//remove old map layer
						map.removeLayer(geojson);
					
					
						// redraw map display
						geojson = L.geoJson(ukData, {				
							style: style,					
							onEachFeature: onEachFeature
						}).addTo(map);
				
				
						//redefine url hash
						hash = new L.Hash(map);
						urli();
						
						
						// reinitialise/redraw map display
						reint();	
						
						
						// if individual GEOUNIT area has been selected by mouse click, geosearch tool or GEOUNIT selection list, bring highlight polygon to front and visible
						if ( unitPolygon != undefined ) { unitPolygon.bringToFront(); }							
					}	
				);
						
						
				/* declaring and initializing of opacity slider ... to be held and used by 'dialogDisplayControls' ... */				
				/* removing this code prevents application to fully load ... :-((( */									
				$("#opacitySlider").slider({
					min:0.01,
					max:1.00,
					value:0.66,
					step:0.01,
					animate:true,
					change: function(event, ui) 
					{ 
					
					
						// update global opacity value
						opcty = $(event.target).slider("value");						
						
						
						//remove old map layer
						map.removeLayer(geojson);
					
					
						// redraw map display
						geojson = L.geoJson(ukData, {				
							style: style,					
							onEachFeature: onEachFeature
						}).addTo(map);
				
				
						//redefine url hash
						hash = new L.Hash(map);
						urli();
						
						
						// reinitialise/redraw map display
						reint();	
						
						
						// if individual GEOUNIT area has been selected by mouse click, geosearch tool or GEOUNIT selection list, bring highlight polygon to front and visible
						if ( unitPolygon != undefined ) { unitPolygon.bringToFront(); }	
					}
				});
				
				
				// initialise time-slider				
				$("#timeSlider").slider({
					min:startYear,
					max:endYear,
					value:startYear,
					step:yearInterval,
					change: function( event, ui ) // fired if time-slider interacted with
					{	 
					
						// store and update global variable with new slider value
						selectedYear = ui.value;							
						
						
						// calculate positions along slider
						selectedYearIndex = (selectedYear-startYear)/yearInterval;									
						
						
						// update year label
						var txt = document.getElementById('currentYear');
						txt.style.display = "block";
						document.getElementById('currentYear').innerHTML = selectedYear;							
									
									
						// reinitialise/redraw map display
						reint();				
					}
				});	
				
				
				// append labels assocaited with opacity control
				var para2=$("<p>").appendTo("#dialogDisplayControls");		
				$(para2).attr("id", "paraLight").html("Light");				
				var para3=$("<p>").appendTo("#dialogDisplayControls");		
				$(para3).attr("id", "paraDark").html("Dark");				
				$("#dialogDisplayControls").dialog( "destroy" );
				
				
				var para10=$("<p>").appendTo("#dialogDisplayControls");		
				$(para10).attr("id", "paraBGTiles").html("Show background tiles?");
				
				
				var para11=$("<p>").appendTo("#dialogDisplayControls");		
				$(para11).attr("id", "paraInvertColors").html("Invert colours?");
								
				
				// build and populate selection lists on main application screen
				menuGeoUnit(); // geo Unit menu
				menuDataVariable(); // Data variable menu
				menuGraphType(); // Graph Type menu	
				
				
				// to process under defined conditions	
				if ( drop.length > 1 ) { addGraphdropElement('Details'); } // if more than one data variable is loaded from 'data'js'
				if ( customDivisions.length > 0 ) { addSplitdropElement('Custom');} // if trendLine array is populated (i.e. a trendline exists for the data) is loaded from 'data'js'
				if ( subDataArrayLength > 1 ) // if data variables represent time-series data
				{					
					$("#timeSlider").css( "display", "inline" );
					$("#loopLabel").css( "display", "inline" );
					$("#loop").css( "display", "inline" );
					$("#startYear").css( "display", "inline" );
					$("#endYear").css( "display", "inline" );
					$("#PlayPauseBtn").css( "display", "inline" );
					$("#mapControlsDiv").css( "height", "70px" );
					$("#mapControlsDiv").css( "top", "590px" );
					$("#boundariesLabel").css( "top", "40px" );
					$("#boundaries").css( "top", "38px" );
					$("#clearBg").css( "top", "495px" );
					$("#range-drop").val('Across year');
					$('#range-drop').attr("disabled", false);					
					
					addGraphdropElement('Time-series');
				}
				
				
				// update and display final banner titles to use				
//				document.getElementById('bannerSubTitle').innerHTML = timeSpan + ", " + geoUnits + ", for " + geoCoverage;
				document.getElementById('bannerSubTitleTemp').innerHTML = singleYearDatasetsYears[selectedDatasetIndex] + ", " + geoUnits + ", in " + geoCoverage;	
				document.getElementById('srcLabel1').innerHTML = sourceInfo[0];		
				document.getElementById('innerTabTitle').innerHTML = innerTabTitle;	
				
				
				if ( variableUnitSymbol[selectedDatasetIndex] != "%" ) { variableUnitSymbol[selectedDatasetIndex] = ' ' + variableUnitSymbol[selectedDatasetIndex]; }
								
												
			}//end drawUI()
						
			
				
			/*
				NAME: 			tiles
				DESCRIPTION: 	detemines and acts on whether user/zoom level has required background tiles
				CALLED FROM:	index.html
				CALLS: 			n/a							
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function tiles()
			{
				var tilesRequired = document.getElementById('BGTilesCheck').checked;
				var currentCenter = map.getCenter();
				var currentZoom = map.getZoom();	
				
				if ( tilesRequired == true )
				{					
					tilelayer = new L.StamenTileLayer("toner-lite");
					map.setView(currentCenter, currentZoom).addLayer(tilelayer);
				}
				else
				{
					map.setView(currentCenter, currentZoom);
					map.removeLayer(tilelayer);					
				}				
				
				
			}// end tiles()
						
			
				
			/*
				NAME: 			addGraphdropElement
				DESCRIPTION: 	defines content of graph-drop' selection list based on number of years and number of datasets
				CALLED FROM:	drawUI
				CALLS: 			n/a		
 				REQUIRES: 		elementVal - additonal selection list element to add
				RETURNS: 		n/a
			*/
			function addGraphdropElement(elementVal)
			{
				
				
				// select HTML element
				var selectmenu = document.getElementById('graph-drop');
				
				
				// create local 'option' variable for selection list and set value
				var option = document.createElement('option');	
				option.setAttribute('value', elementVal);
				
				
				// modify inner html text and append to selection list
				option.innerHTML = elementVal;
				selectmenu.appendChild(option);
				
									
			}//end addGraphdropElement(elementVal)
						
			
				
			/*
				NAME: 			addSplitdropElement
				DESCRIPTION: 	
				CALLED FROM:	drawUI
				CALLS: 			n/a		
 				REQUIRES: 		elementVal - additonal selection list element to add
				RETURNS: 		n/a
			*/
			function addSplitdropElement(elementVal)
			{
				
				// select HTML element
				var selectmenu = document.getElementById('split-drop');
				
				
				// create local 'option' variable for selection list and set value
				var option = document.createElement('option');	
				option.setAttribute('value', elementVal);
				
				
				// modify inner html text and append to selection list
				option.innerHTML = elementVal;
				selectmenu.appendChild(option);
				
						
				$("#split-drop").val('Custom'); // Redefine default starting value for selection list
				$("#divisions-drop").val(customDivisions.length); // Redefine default starting value for selection list				
				
									
			}//end addSplitdropElement(elementVal)
						
			
				
			/*
				NAME: 			reint
				DESCRIPTION: 	reinitialisation function to reset variables and rebuild UI
				CALLED FROM:	loadDisplay
								redrawUI
				CALLS: 			fixHighlightPoly
								getInfo		
								updateSimpleGraph
								geo
								drawTimeSeries
								urli
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function reint()
			{
							
			
				// detemine and store new display parameter user selections as gobal variables
				selectedDatasetIndex = drop.indexOf(document.getElementById("dv-drop").value);
				splitType = document.getElementById("split-drop").value;
				if ( splitType == 'Custom' ) { numColorDivs = customDivisions.length; }
				else { numColorDivs = document.getElementById("divisions-drop").value; }
				selectedDataset = document.getElementById("dv-drop").value;
				graphType = document.getElementById("graph-drop").value;
				rangeType = document.getElementById("range-drop").value;
				opcty = $('#opacitySlider').slider('value');
				
				
				// remove old boundary map layer from display
				map.removeLayer(geojson);

				
				// empty global array to contain number of GEOUNITs in each data band
				for (var i = 0; i < numColorDivs; i++) { RangeCounts[i] = 0; }
				
				
				// define data split values based on split type, number of divisions, whether data limits are from across all years or a single year, and dataset selected by user.					
				     if ( splitType == "Equal Intervals" ) { changeDivisionsEqualIntervals(); }
				else if ( splitType == "Quantiles" )       { changeDivisionsQuantiles();      }
				else if ( splitType == "Natural Jenks" )   { changeDivisionsJenks();          }
				else if ( splitType == "Custom" )          { changeDivisionsCustom();         }
				
								
				// check to display prompt text to select a GEOUNIT if user selected "Details" or "Time-series"
				if ( document.getElementById('graph-drop').value == "Details" || document.getElementById('graph-drop').value == "Time-series" && highlightedGEOUNIT == false ) { $('#hoverPrompt').css( "display", "inline" ); }
				else{ $('#hoverPrompt').css( "display", "none" ); }
										
				
				// if user  has selected a GEOUNIT from slection list, geosearch tool or hovered/click on area  get area's variable information for all datasets presented
				if( hasHovered == true || highlightedGEOUNIT == true ) { getInfo(layerReference); }
				
				
				// update array length for counting number of units in data bands based on current user selection of 'divisions-drop'
				RangeCounts.length = numColorDivs;
				
				
				// redraw legend. Udpate counts for number of units in data bands
				// redraw map layer area based on current selections
				// redraw graphing area based on current selections				
				updateSimpleGraph(selectedDataset);
				geo(selectedDataset);
				updateSimpleGraph(selectedDataset);			
				drawTimeSeries();	
				
				
				// update stored metadata/information based on current dataset selcted by user				
				metadataStr = metadata[selectedDatasetIndex];
				
				
				//update dynamic titles and text on main app window based on current user selections 
				document.getElementById('infoPara').innerHTML = "<u>" + selectedDataset + "</u>";
				document.getElementById('infoParaInfo').innerHTML = metadataStr;
				document.getElementById('srcLabel1').innerHTML = sourceInfo[selectedDatasetIndex];
				document.getElementById('bannerTitle').innerHTML = Title[selectedDatasetIndex];
				
				
				// modify subtitle if application is presenting time-series data
				if ( subDataArrayLength == 1 )
				{
					document.getElementById('bannerSubTitle').innerHTML = singleYearDatasetsYears[selectedDatasetIndex] + ", " + geoUnits + ", for " + geoCoverage;
					document.getElementById('currentYear').innerHTML = singleYearDatasetsYears[selectedDatasetIndex];
				}					
				
				
				
				if ( subDataArrayLength == 1 )
				{
					
					if ( selectedDatasetIndex == 1 )
					{
						$("#currentYear").css( "top", "120px" );
						$("#currentYear").css( "left", "340px" );
						
						$("#currentYearBg").css( "top", "115" );
						$("#currentYearBg").css( "left", "330px" );
						$("#currentYearBg").css( "width", "200px" );
					}
					
					else if ( selectedDatasetIndex == 4 )
					{
//							$("#currentYear").css( "font-size", "11px" );
//							$("#currentYear").css( "font-size", "11px" );
//							$("#currentYear").css( "font-size", "11px" );
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "255px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "245px" );
							$("#currentYearBg").css( "width", "280px" );
					}							
					else
					{
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "465px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "455px" );
							$("#currentYearBg").css( "width", "65px" );	
					}
					
					document.getElementById('currentYear').innerHTML = singleYearDatasetsYears[selectedDatasetIndex];
					$('#range-drop').attr("disabled", true); 
					
				}
				else {
					
					if ( selectedDatasetIndex == 1 )
					{
						$("#currentYear").css( "top", "120px" );
						$("#currentYear").css( "left", "340px" );
						
						$("#currentYearBg").css( "top", "115" );
						$("#currentYearBg").css( "left", "330px" );
						$("#currentYearBg").css( "width", "200px" );
					}
					
					else if ( selectedDatasetIndex == 4 )
					{
//							$("#currentYear").css( "font-size", "11px" );
						$("#currentYear").css( "top", "120px" );
						$("#currentYear").css( "left", "180px" );
						
						$("#currentYearBg").css( "top", "115px" );
						$("#currentYearBg").css( "left", "170px" );
						$("#currentYearBg").css( "width", "355px" );
					}							
					else
					{
							$("#currentYear").css( "top", "120px" );
							$("#currentYear").css( "left", "465px" );
							
							$("#currentYearBg").css( "top", "115px" );
							$("#currentYearBg").css( "left", "455px" );
							$("#currentYearBg").css( "width", "65px" );	

					}
					document.getElementById('currentYear').innerHTML = startYear;
				}				
				
				
				// reset boolean variable to prevent recounting/repopulating rangeCounts array																				
				needToRecalculateNumberInGrps = false; 
				
				
				// if user has physcially selected an GEOUNIT center on area map polygon and highlight with complamentary colouring							
				if ( highlightedGEOUNIT == true ) { fixHighlightPoly(); }
				
				
				// update URL hash line based on current/new selections
				hash = new L.Hash(map);
				urli();
				
				
			}//end reint()	
						
			
				
			/*
				NAME: 			geo
				DESCRIPTION: 	draws full boundary layer, using styles defined by 'style()'
				CALLED FROM:	clearSelectedGEOUNIT
								reint
				CALLS:			style
								onEachFeature
 				REQUIRES: 		l - dataset selected by user
				RETURNS: 		n/a
			*/
			function geo(l)
			{			
			
			
				//	draw boundary map layer and append to display using data from 'data.js' and CSS styles outlined in 'style' function
				geojson = L.geoJson(ukData, {				
					style: style,					
					onEachFeature: onEachFeature
				}).addTo(map);
				
											
			} //end geo(l)	
						
			
				
			/*
				NAME: 			getInitialSettings
				DESCRIPTION: 	Retrieves initial setttings from time-slider, 'config.js' and HTML elements.
								Sets initial titles
				CALLED FROM:	$(document).ready
				CALLS: 			n/a			
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function getInitialSettings()
			{			
			
			
				// On initial load of application display, determine initial starting parameterisation (mostly sourced from config.js)
				startYear = $('#timeSlider').slider('option',  'min');
				yearInterval = $('#timeSlider').slider('option',  'step');
				selectedYear = $('#timeSlider').slider('option', 'value');
				selectedYearIndex = (selectedYear-startYear)/yearInterval;
				selectedDatasetIndex = drop.indexOf(document.getElementById("dv-drop").value);
				selectedDataset = document.getElementById("dv-drop").value;
				graphType = document.getElementById("graph-drop").value;
				rangeType = document.getElementById("range-drop").value;
				opcty = $('#opacitySlider').slider('value');		
				selectedGEOUNITVariables.length = NumberOfDataSets;
				
				
				// modify initial titles				
				document.getElementById('startYear').innerHTML = startYear.toFixed(0);
				document.getElementById('endYear').innerHTML = endYear.toFixed(0);
				document.getElementById('bannerTitle').innerHTML = Title[0];
				
				
			}//end getInitialSettings()
						
			
				
			/*
				NAME: 			menuDataVariable
				DESCRIPTION: 	constructs 'dv-drop' data variable selection list based on content of "drop[]"
				CALLED FROM:	drawUI
				CALLS: 			n/a	 					
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function menuDataVariable()
			{	
			
			
				// select required HTML element for updating
				var selectmenu = document.getElementById('dv-drop');
			
			
				// for each element in array drop() (containing text strings for each dataset variable name
				for(var i = 0; i < drop.length; i++)
				{	
				
					// create a new selection list option
					// set new options's value to array element.
					// Update inner HTML string for the option
					// append to selection menu
					var option = document.createElement('option');	
					option.setAttribute('value', drop[i]);
					option.innerHTML = drop[i];
					selectmenu.appendChild(option);
				}
				
				
				$("#dv-drop").val("Population, aged 65 years+");
				
				
			}//end menuDataVariable()
						
			
				
			/*
				NAME: 			menuGraphType
				DESCRIPTION: 	constructs 'graph-drop' graph type selection list based on content of "drop6[]" in 'config.js'
				CALLED FROM:	drawUI
				CALLS: 			n/a					
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function menuGraphType()
			{	
			
			
				// select required HTML element for updating
				var selectmenu = document.getElementById('graph-drop');
			
			
				// for each element in array drop6() (containing text strings for each dataset variable name)
				for(var i = 0; i < drop6.length; i++)
				{	
				
					// create a new selection list option
					// set new options's value to array element.
					// Update inner HTML string for the option
					// append to selection menu
					var option = document.createElement('option');	
					option.setAttribute('value', drop6[i]);
					option.innerHTML = drop6[i];
					selectmenu.appendChild(option);
				}
				
				
				// Define default starting value 	
				$("#graph-drop").val('Rank'); 
				
				
			}//end menuGraphType()
						
			
				
			/*
				NAME: 			menuGeoUnit
				DESCRIPTION: 	constructs 'geounit-drop' geographic unit selection list based on content of 'data.js'
				CALLED FROM:	drawUI
				CALLS: 			n/a				
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function menuGeoUnit()
			{	
			
			
				// select required HTML element for updating
				var selectmenu = document.getElementById('geoUnit-drop');
				
				
				// make a copy of array containing correct GEOUNIT names, then sort alphabetically ascending				
				var GEOUNITArrayCopy = GEOUNIT_Name.slice();
				GEOUNITArrayCopy.sort();
				
				
				// create and populate default starting value and append to selection list				
				var option = document.createElement('option');
				option.innerHTML = 'select an area...';
				selectmenu.appendChild(option);
			
			
				// for each geography unit listed in 'data.js'
				for(var i = 0; i < numElements; i++)
				{	
				
					// create a new selection list option
					// set new options's value to array element.
					// Update inner HTML string for the option
					// append to selection menu
					var option = document.createElement('option');	
					option.setAttribute('value', GEOUNITArrayCopy[i]);
					option.innerHTML = GEOUNITArrayCopy[i];
					selectmenu.appendChild(option);
				}
				
				
			}//end menuGeoUnit()
						
			
				
			/*
				NAME: 			fixHighlightPoly
				DESCRIPTION: 	highlights and fixes on single GeoJson polygon selected by user via mouse-click, geosearch control or 'geoUnit-drop'.
							 	Polygon highlighted in complementary color retrieved from 'colorbrewer.js'
				CALLED FROM:	selectGEOUNIT
								drawTimeSeries
								reint
				CALLS: 					
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function fixHighlightPoly()
			{	
			
			
				// if highlight polygon has already been created and is currently visible on the map display												
				if ( unitPolygon != undefined ) { map.removeLayer(unitPolygon); }
				else { }
				
				
				// detemine index of selected GEOUNIT (using its code) as listed in 'data.js'
				// extract and store this GEOUNIT's geometry informatino extracted from 'data.js'				
				indexOfCurrentHoverOverGEOUNIT_CD = GEOUNIT_Code.indexOf(currentHoverOverGEOUNIT_CD);
				geomType = ukData.features[indexOfCurrentHoverOverGEOUNIT_CD].geometry;
				
				
				// create new polygon for highlighting selected GEOUNIT, using complamentary colour taken from 'colorbrewer.js'  
				unitPolygon = new L.GeoJSON(geomType);
				unitPolygon.setStyle({
					weight: 3,
					color: compColour,
					dashArray: '',
					fillOpacity: 0.0,
					opacity: 1.0
				});
				
				
				// adde new created polygon to map and bring to front if certain browsers are being used
				unitPolygon.addTo(map);
				unitPolygon.bringToFront();
				if (!L.Browser.ie && !L.Browser.opera) { unitPolygon.bringToFront(); }
				
				
			}// end fixHighlightPoly()	
						
			
				
			/*
				NAME: 			flood_fixHighlightPoly
				DESCRIPTION: 	highlights and fixes on array of GeoJson polygons selected by user via mouse hover-over on legend
							 	Polygons highlighted in complementary color retrieved from 'colorbrewer.js'
				CALLED FROM:	updateSimpleGraph
				CALLS: 			n/a		
 				REQUIRES: 		num - number of geoJson polygons/GEOUNITs contained withing divisions/grades range
				RETURNS: 		n/a
			*/
			function flood_fixHighlightPoly(num)
			{		
			
			
				// define local variable to store individual new polygon			
				var legendPolygon;
				
				
				// if array/sub array for particualr legend division band is defined and populationed
				if ( markedPolys[num] )
				{
					
					
					// for each element in array's sub-array (sub-array refers to specific data range band)
					for (var i=0; i<markedPolys[num].length; i++ )
					{	
					
						
						//set local variable to content of array sub-array, and add local var to map layer
						// bring to front certain browsers are in use
						legendPolygon = markedPolys[num][i];						
						legendPolygon.addTo(map);
						legendPolygon.bringToFront();
						if (!L.Browser.ie && !L.Browser.opera) { legendPolygon.bringToFront(); }
					}
				}
				
				return;
				
				
			}// end flood_fixHighlightPoly(num)	
						
			
				
			/*
				NAME: 			getColor
				DESCRIPTION: 	extracts and determines colour to use for filling GEOUNIT polygon and its complementary colour for highlightin
								'ColorBrewer.js' colour arrays are ordered light [array element 0] to dark [array element 'Length-1']
				CALLED FROM:	style
								updateSimpleGraph
								drawTimeSeries
				CALLS: 			n/a			
 				REQUIRES: 		d - specific data value to text against grades[]/divisions[] tp detemine which data bad it falls into
                          		route - text string defining other function that called this function
				RETURNS: 		selectedColor - colour selected to fill the specific geoJson polygon associated to value 'd'
			*/
			function getColor(d, route)
			{	
				
				// set local variables
				var replacePattern = /\)\,r/gi;	// replacement regular expression to search for in color array extracted from 'colorbrewer.js'
				var i; // iteration variable
				var divisionValue;// local variable to hold current data division to consider				
				var grades = new Array(); // local array to hold data divisions to use
				palette = document.getElementById('color-drop').value; // global variable set to value selected by user on color palette				
		//		compColour = colorbrewer[palette].complementary; // set global var to complamentary colour from colorbrewer.js specific to selected colour palette
									
					
				// boolean check to detemine which array of data divisions to access and use depending on what users have selected to define data limits.
				// Either standard set of divisions (contained by array 'divisions') if user has not checked ON the 'Fixed Data Ranges' checkbox, or
				// the specific set contained by array fixedDataRanges that is populated when user checks ON.
				if ( fixedValCheck == true ) { grades = fixedDataRanges; }
				else if ( customCheck == true ) { grades = customDivisions; }				
				else { grades = divisions; }
												
				
				// for  number of divisions selected on divisions-drop
				for ( i=numColorDivs-1; i>=0; i-- )
				{														
				
				
					// special case to define current division value to "-Infinity" if it is lower bound to lowest data band
					if ( i==0 ) { divisionValue = -Infinity; }
					else { divisionValue = grades[i]; }
				
										
					//do something if GEOUNIT value is greater than or equal to increment division
					if ( Number(d) >= Number(divisionValue) && d != null )					
					{	
						
					
						// set data variable value to fixed precision
						d = (Number(d)).toFixed(2);	
						
						
						// pick out color array from 'colorbrewer.js' based on color palette and number of divisions selected
						if(document.getElementById("colourInvertCheck").checked == false )
						{
							colors = colorbrewer["normal"][palette][numColorDivs];
							compColour = colorbrewer["normal"][palette].complementary; // set global var to complamentary colour from colorbrewer.js specific to selected colour palette
						}
						else
						{
							colors = colorbrewer["inverted"][palette][numColorDivs];
							compColour = colorbrewer["inverted"][palette].complementary; // set global var to complamentary colour from colorbrewer.js specific to selected colour palette
						}
						
			
						// no color array available, continue to next iteration	
						if( colors == undefined ) { continue; } 
			
			
						// format and extract specific color for data variable submitted
						var ColorStr  = String(colors);
						ColorStr      = ColorStr.replace(replacePattern , ") r");
						var color     = ColorStr.split(" ");
						selectedColor = color[i];
						
						
						// increase counting array by 1 if GEOUNIT value is found to be in data band and function is entered from specific function call								
						if ( route == "style" && needToRecalculateNumberInGrps == true && rankMouseOver != true ) { RangeCounts[i] = RangeCounts[i]+1; }
						
						
						hoveredGrade = i;
											
											
						return selectedColor;
					}					
				}
				
				
				// reset data variable
				d = null;
				
				
			}//end getColor(d, route)	
						
			
				
			/*
				NAME: 			style
				DESCRIPTION: 	defines drawing style for each polygon, depending whether 'bonudaries' checkbox is selected on UI
				CALLED FROM:	onEachFeature
								drawUI
								geo
				CALLS: 			getColor								
 				REQUIRES: 		feature - geoJson polygon object user has interacted with on map interface
				RETURNS: 		CSS attribution to [re]draw each individual polygon
			*/
			function style(feature)
			{		
			
			
				// define color definition for a GEOUNIT polygon on map layer based on dataset and year selected by user,
				// IF the boundaries check box is unselected (i.e. no boundaries are to be shown on main map)
				if( document.getElementById('boundaries').checked == false )
				{				
						
					return {
						weight: 0,
						opacity: 0.,		
						color: getColor(feature	['properties']
												['datavalues']
												[selectedDatasetIndex]										
												[selectedYearIndex], ""									
											),				
						fillOpacity: opcty,
						fillColor: getColor(feature	['properties']
													['datavalues']
													[selectedDatasetIndex]										
													[selectedYearIndex], "style"										
											)
					};	
				}
				
				
				// define color definition if the boundaries check box is selected (i.e. boundaries are to be shown on main map)				
				else
				{		
					return {
						weight: 1,
						opacity: 1.,
						color: '#E8E8E8',			
						fillOpacity: opcty,
						fillColor: getColor(feature	['properties']
													['datavalues']
													[selectedDatasetIndex]										
													[selectedYearIndex], "style"										
											)
					};
				}
				
				
			} //end style(feature)	
						
			
				
			/*
				NAME: 			selectGEOUNIT
				DESCRIPTION: 	extracts (lat, lon) cororinmate information from 'data.js'; method changes depending on whether accessed via geosearch control input or selection on 'geoUnit-drop'
				CALLED FROM:	leaflet-pip.js (file)
								interaction with 'geoUnit-drop' selection list
				CALLS: 			getInfo
								fixHighlightPoly
								updateSimpleGraph
								drawTimeSeries								
 				REQUIRES: 		e - the interaction 'event' 
                          		src -  text string that detemines how function was called ("drop" - called from 'geoUnit-drop')								
				RETURNS: 		n/a
			*/
			function selectGEOUNIT(e, src)
			{		
			
			
				// if dataset(s) are time-series, re-position clear button (fudge as CSS commands in 'drawUI()' do not work).
				if ( subDataArrayLength > 1 ) { $("#clearBtn_ts").css( "display", "inline" ); }
				else { $("#clearBtn_sy").css( "display", "inline" ); }
				
				
				// if GEOUNIT has been selected by user from 'geoUnit-drop' selection list					
				if ( src == "drop" )
				{	
				
				
					// update required variables based on values selected on selection lists or extracted from 'data.js'
					var ladIndex = GEOUNIT_Name.indexOf(e);										
					currentHoverOverGEOUNIT_CD = ukData.features[ladIndex].properties.GEOUNIT_CD; // get selected GEOUNIT name
					currentHoverOverGEOUNIT_NM = ukData.features[ladIndex].properties.GEOUNIT_NM; // get selected GEOUNIT code
					geomStrArray = ((ukData.features[ladIndex].geometry.coordinates).toString()).split(","); // get geometry information for GEOUNIT from 'data.js'
					geomType = ukData.features[ladIndex].geometry; // is it a 'multipolygon' or simplier 'polygon' 
					evented = e.target;	// set event 'e' to global variable for use in other functions.
					highlightedGEOUNIT = true; // a GEOUNIT polygon ahs been selected and interacted with
					hasHovered = true; // a GEOUNIT polygon ahs been selected and interacted with					
					layerReference = ukData.features[ladIndex].properties;
					
					
					// get specific information for selected GEOUNIT
					getInfo(layerReference);
					
					
					// initial arrays to contain lat.long value extracted from data.js					
					var latArray = new Array();
					var lonArray = new Array();					
					
					
					// for each element in array of polygon coordinates
					for(var i=0; i<geomStrArray.length; i++ )
					{
						
						
						// even indexes ... (longitudes)
						if(i%2 == 0) { lonArray.push(geomStrArray[i]); }						
						
						
						// odd indexes ... (latitudes)
						else { latArray.push(geomStrArray[i]); }
					}
					
					
					
					// sort stored latitude array descending and then ascending to detemine max and min values respectively.
					// Repeat process for longitudes.
					var maxLat = (latArray.sort(function(a,b){return b-a}))[0];
					var minLat = (latArray.sort(function(a,b){return a-b}))[0];					
					var maxLon = (lonArray.sort(function(a,b){return b-a}))[0];
					var minLon = (lonArray.sort(function(a,b){return a-b}))[0];
					
					
					// construct bounding box use lat/long mins/maxs
					var southWest = new L.LatLng( minLat , minLon ),
						northEast = new L.LatLng( maxLat , maxLon ),
						bounds = new L.LatLngBounds();  
					bounds.extend(southWest);
					bounds.extend(northEast);				
					
					
					// reposition map boundary layer extent and zoom to selected GEOUNIT based on newly select area's lat/lon geometry
					map.fitBounds(bounds, {
						paddingTopLeft: [40,0],
						paddingBottomRight: [75,400]
					});
					
					
					// call function to define and show separate highlight polygon over GEOUNIT's polygon embedded in main map layer								
					fixHighlightPoly();
						
						
					// update specific CSS attribution
					if ( subDataArrayLength > 1 ) { $('.mainDiv').append("<a href=" + "'javascript:clearSelectedGEOUNIT()' " + 'id="clearBtn_ts" title="Clear selection"></a>'); }
					else { $('.mainDiv').append("<a href=" + "'javascript:clearSelectedGEOUNIT()' " + 'id="clearBtn_sy" title="Clear selection"></a>'); }									
					
					$( "#clearBg" ).css( "display", "inline" );
					$( "#geoUnit-drop" ).prop( "disabled", true );
					$( "#leaflet-control-geosearch-qry" ).prop( "disabled", true );					
					document.getElementById("leaflet-control-geosearch-qry").value = document.getElementById("geoUnit-drop").value;
				}					


				// enter if GEOUNIT has been selected by user using geosearch tool ('leaflet-control-geosearch-qry') or mouse
				else
				{	
				
				
					// update required variables based on values selected on selection lists or extracted from 'data.js'
					highlightedGEOUNIT = true; // a GEOUNIT polygon ahs been selected and interacted with				
					geomStrArray = (latlngsArray.toString()).split(","); // get geometry information for GEOUNIT from 'data.js'					
					layerReference = ukData.features[layer_count].properties;
					
					
					// get specific information for selected GEOUNIT
					getInfo(layerReference);
					
					
					// initial arrays to contain lat.long value extracted from data.js					
					var latArray = new Array();
					var lonArray = new Array();					
					
					
					// for each element in array of polygon coordinates
					for(var i=0; i<geomStrArray.length; i++ )
					{
						
						
						// even indexes ... (longitudes)
						if(i%2 == 0) { lonArray.push(geomStrArray[i]); }
						
						
						// odd indexes ... (latitudes)
						else { latArray.push(geomStrArray[i]); }
					}
					
					
					
					// sort stored latitude array descending and then ascending to detemine max and min values respectively.
					// Repeat process for longitudes.
					var maxLat = (latArray.sort(function(a,b){return b-a}))[0];
					var minLat = (latArray.sort(function(a,b){return a-b}))[0];					
					var maxLon = (lonArray.sort(function(a,b){return b-a}))[0];
					var minLon = (lonArray.sort(function(a,b){return a-b}))[0];	
					
					
					// construct bounding box use lat/long mins/maxs
					var southWest = new L.LatLng( minLat , minLon ),
						northEast = new L.LatLng( maxLat , maxLon ),
						bounds = new L.LatLngBounds();	  
					bounds.extend(southWest);
					bounds.extend(northEast);			
					
					
					// reposition map boundary layer extent and zoom to selected GEOUNIT based on newly select area's lat/lon geometry
					map.fitBounds(bounds, {
						paddingTopLeft: [40,0],
						paddingBottomRight: [75,400]
					});	
					
					
					// call function to define and show separate highlight polygon over GEOUNIT's polygon embedded in main map layer								
					fixHighlightPoly();
						

					// update specific CSS attribution
					if ( subDataArrayLength > 1 ) { $('.mainDiv').append("<a href=" + "'javascript:clearSelectedGEOUNIT()' " + 'id="clearBtn_ts" title="Clear selection"></a>'); }
					else { $('.mainDiv').append("<a href=" + "'javascript:clearSelectedGEOUNIT()' " + 'id="clearBtn_sy" title="Clear selection"></a>'); }
				
					$( "#clearBg" ).css( "display", "inline" );
					$( "#geoUnit-drop" ).prop( "disabled", true );
					$( "#leaflet-control-geosearch-qry"  ).prop( "disabled", true );
				}
						

				// update specific CSS attribution
				$( "#leaflet-control-geosearch-qry" ).attr( "title", "Press 'Clear' before entering a new address" );
				$( "#geoUnit-drop"  ).attr( "title", "Press 'Clear' before selecting a new area" );
							
				
				// call functions tyo redraw graph and legend areas
				updateSimpleGraph(selectedDataset);
				drawTimeSeries();
				
									
			} //end selectGEOUNIT(e, src)	
						
			
				
			/*
				NAME: 			onEachFeature
				DESCRIPTION: 	defines actions to take resulting from user mouse input
				CALLED FROM:	drawUI
								geo
				CALLS: 			highlightFeature
                       			zoomToFeature
								resetHighlight
 				REQUIRES: 		feature - 
                          		layer - layer object of single or multiple polygons
				RETURNS: 		n/a
			*/
			function onEachFeature(feature, layer)
			{
				
				
				// call action specific to a certain interaction with an individual GEOUNIT polygon on map layer
				layer.on({
					mouseover: highlightFeature,
					click: zoomToFeature,
					mouseout: resetHighlight
				});	
	
				
			} //end onEachFeature(feature, layer)	
						
			
				
			/*
				NAME: 			highlightFeature
				DESCRIPTION: 	highlights feature selected by user using colors retrieved from 'colorbrewer.js'. Executed on user 'mouseover'
				CALLED FROM:	onEachFeature
				CALLS: 			getInfo
								drawTimeSeries
								updateSimpleGraph
 				REQUIRES: 		e - event
				RETURNS: 		n/a
			*/
			function highlightFeature(e)
			{	
				
				
				////NEW CODE IN HERE TO RESET STYLE (IE NOTICES MOUSEOVER NOT MOUSEOUT SO THIS CATCHES THIS
				//d3.select(x).attr("stroke","red");	 			
				var layer = '';
				
				
				if ( /*L.Browser.ie &&*/ highlightedGEOUNIT == false && highfirst == false)
				{
					needToRecalculateNumberInGrps = false;	
					rankMouseOver = false;
									
					geojson.resetStyle(previous);
					//resetHighlight();
				
				}
				
				
				if ( highlightedGEOUNIT == false /*&& highlightedLegend == false*/ )
				{
				
								
					// check to display prompt text to sellect a GEOUNIT if user selcted "Details" or "Time-series"
					if ( document.getElementById('graph-drop').value == "Details" || document.getElementById('graph-drop').value == "Time-series" ) { $('#hoverPrompt').css( "display", "none" ); }
					else{ $('#hoverPrompt').css( "display", "none" ); }
					
					
					highfirst=false;	
																		
					if ( played == 'no' ) { layer = evented; }			
					else { layer = e.target; }
					
								
					hasHovered = true;
				
					layer.setStyle({
						weight: 3,
						color: compColour,
						dashArray: '',
						Opacity: opcty
					});
					
					layer.bringToFront();												
					if (!L.Browser.ie && !L.Browser.opera) { layer.bringToFront(); }
				
					currentHoverOverGEOUNIT_CD = layer.feature.properties.GEOUNIT_CD;
					currentHoverOverGEOUNIT_NM = layer.feature.properties.GEOUNIT_NM;
					
					
					//enable all graph type select list
					document.getElementById('graph-drop').disabled = false;
					
					layerReference = layer.feature.properties;
					getInfo(layerReference);
					drawTimeSeries();			
				
					needToRecalculateNumberInGrps = false;	
					updateSimpleGraph(selectedDataset);
					
					previous = e.target;
					previousSelection = true;
					
					
				}
				else
				{				
					// entered if a geography unit has been selected and frozen, but a user hovers over a different geography unit.			
								
					// check to display prompt text to sellect a GEOUNIT if user selcted "Details" or "Time-series"
				 	$('#hoverPrompt').css( "display", "none" ); 			
				}
				
			} //end highlightFeature(e)	
						
			
				
			/*
				NAME: 			zoomToFeature
				DESCRIPTION: 	zooms into feature selected by user using colors retrieved from 'colorbrewer.js'. Executed on '[mouse] click'
				CALLED FROM:	onEachFeature
				CALLS: 			n/a
 				REQUIRES: 		e - event
				RETURNS: 		n/a
			*/
			function zoomToFeature(e) 
			{		
			
			
				// if no area polygon has already been selected on the map layer when the current one has been selected ...
				if ( highlightedGEOUNIT == false )
				{		
				
					
					// update global variables
					evented = e.target;	
					latlngsArray = evented.feature.geometry.coordinates;
					geomType = evented.feature.geometry;																				
					var bounds = e.target.getBounds();
					highlightedGEOUNIT = true;
					
					
					// reposition map to fit selected area
					map.fitBounds(bounds);	
					
					
					// update specific CSS attribution
					if ( subDataArrayLength > 1 ) { $('.mainDiv').append("<a href=" + "'javascript:clearSelectedGEOUNIT()' " + 'id="clearBtn_ts" title="Clear selection"></a>'); }
					else { $('.mainDiv').append("<a href=" + "'javascript:clearSelectedGEOUNIT()' " + 'id="clearBtn_sy" title="Clear selection"></a>'); }

					$( "#clearBg" ).css( "display", "inline" );
					$( "#geoUnit-drop" ).prop( "disabled", true );
					$( "#leaflet-control-geosearch-qry" ).prop( "disabled", true );		
					document.getElementById( "geoUnit-drop" ).value = evented.feature.properties.GEOUNIT_NM;
					document.getElementById("leaflet-control-geosearch-qry").value = document.getElementById("geoUnit-drop").value;					
				}
				
				
				// do nothing ...
				else
				{	
					// entered if a geography unit has been selected and frozen, but a user hovers over a different geography unit.
				}
				
			
			} //end zoomToFeature(e)	
						
			
				
			/*
				NAME: 			resetHighlight
				DESCRIPTION: 	removes highlighting styles from feature selected by user after Clear Button is pressed by user. Executed on '[mouse] out'
				CALLED FROM:	onEachFeature
				CALLS: 			getInfo
								updateSimpleGraph
								drawTimeSeries
 				REQUIRES: 		e - event
				RETURNS: 		n/a
			*/
			function resetHighlight(e) // executed on 'mouseout'
			{
										
				
				// update need to recalculate number of GEOUNITs in each data band presented on legend
				needToRecalculateNumberInGrps = false;				
				
								
				// check to display prompt text to sellect a GEOUNIT if user selcted "Details" or "Time-series"
				if ( document.getElementById('graph-drop').value == "Details" || document.getElementById('graph-drop').value == "Time-series" && highlightedGEOUNIT == false ) { $('#hoverPrompt').css( "display", "inline" ); }
				else{ $('#hoverPrompt').css( "display", "none" ); }
								
				
				// do nothing if a GEOUNIT area has been selected
				if ( highlightedGEOUNIT == true )
				{
					$('#hoverPrompt').css( "display", "none" );
				}
				
				
				// else, if no area has been selected
				else if ( highlightedGEOUNIT == false )
				{	
					
					
					// reset polygon style to boundary map layer
					geojson.resetStyle(e.target);
					
					
					// reset variables to now denote no area is currently selected by the user, by any means
					hasHovered = false;							
					needToRecalculateNumberInGrps = false;
					
					
					// call functions to redraw legend and graph area ccordingly.
					updateSimpleGraph(selectedDataset);
					drawTimeSeries();	
				}
				
				
			} // end resetHighlight(e)	
						
			
				
			/*
				NAME: 			clearSelectedGEOUNIT
				DESCRIPTION: 	clears main components (i.e. map, legend and graphing areas) of all highlighting; zooms back out to initial preset level
				CALLED FROM:	user interaction with '#ClearBtn;
				CALLS:			clearMarker
								getInfo
								redrawUI
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function clearSelectedGEOUNIT()
			{
				
				
				// if there is currently a GEOUNIT selected and thus a highlight polygon constructed and overlain
				if ( highlightedGEOUNIT == true )
				{
					
					
					// reset variables denoting a polygon has been selected; clear array for dotring lat/lon information
					highlightedGEOUNIT = false;
					hasHovered = false;	
					latlngsArray = [];	
					
					
					// if there is already a highlight polygon defined and displayed over the map layer, remove it
					if ( unitPolygon != undefined ) { map.removeLayer(unitPolygon); }
  
  
  					// clear position marker if one has been plotted by user using geosearch tool
					clearMarker();
					
					
					// update CSS attibution										
					$( "#clearBtn_ts" ).remove();								
					$( "#clearBtn_sy" ).remove();
					$( "#clearBg" ).css( "display", "none" );
					$( "#geoUnit-drop" ).prop( "disabled", false );
					$( "#leaflet-control-geosearch-qry"  ).prop( "disabled", false );
					$( "#leaflet-control-geosearch-qry"  ).attr( "title", '' );
					$( "#geoUnit-drop"  ).attr( "title", '' );
										
					
					// update HTML 
					document.getElementById( "geoUnit-drop" ).value = "select an area...";
					document.getElementById( "graph-drop" ).value = "Rank";
					document.getElementById("leaflet-control-geosearch-qry").value = '';
				
				
					// if 'e' event has been defined elsewhere	
					if ( evented != undefined ) { geojson.resetStyle(evented); }


					// redraw UI
					reint();
					
					
					// zoom to original view (zoom, lat and lon) ...
					view = new L.LatLng(centerLat, centerLong);
					map.setView(view, zoom).addLayer(layer);								
	
				}
				
				
				// else, do nothing (catch-all)		
				else
				{
					// else, do nothing (catch-all)						
				}
				
				
			} // end clearSelectedGEOUNIT()	
						
			
				
			/*
				NAME: 			getInfo
				DESCRIPTION: 	retreives data information from 'data.js' based on year selected and number of datasets loaded
				CALLED FROM:	selectGEOUNIT
								highlightFeature
								resetHighlight
				CALLS:			n/a
 				REQUIRES: 		properties - content (all data and geometry information) extracted from 'data.js'
				RETURNS: 		n/a
			*/
			function getInfo(properties)
			{	
			
			
				//	if function argument is defined
				if( properties != undefined )
				{
					
					
					// clear previous values in global array 
					selectedGEOUNITVariables = [];													 
		
		
					// repopulate now-empty array with new data variables from 'data.js' for use with grpah plotting
					for ( var i=0; i<NumberOfDataSets; i++ ) { selectedGEOUNITVariables[i] = properties.datavalues[i][selectedYearIndex]; }
				}
				
				
				// else, do nothing (catch-all)						
				else
				{
					// else, do nothing (catch-all)						
				}

				return;
				
				
			}// end getInfo(properties)	
						
			
				
			/*
				NAME: 			clearMarker
				DESCRIPTION: 	retreives data information from 'data.js' based on year selected and number of datasets loaded
				CALLED FROM:	l.control.geosearch.js (file)
								clearSelectedGEOUNIT
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function clearMarker()
			{


				// if markers array is defined and populated
				if ( markers != undefined )
				{
					
					// for each element, remove marker from layer
					for ( var i=0; i<markers.length; i++ ) { map.removeLayer(markers[i]); }					
					
					
					// empty/nullify array
					markers = [];
				}						
							
								
			}//end clearMarker()
			
			
			
			/*
				NAME: 			updateSimpleGraph
				DESCRIPTION: 	[re]draws dynamic legend to lower-right of UI. 
				CALLED FROM:	$(document).ready
								redrawUI
								reint
								selectGEOUNIT
								highlightFeature
								resetHighlight
				CALLS:			getColor
								changeDivisionsEqualIntervals
								changeDivisionsQuantiles
								changeDivisionsJenks
								style
								flood_fixHighlightPoly
								filterRangeGeoUnits
 				REQUIRES: 		l - dataset selected by user
				RETURNS: 		div - new div constructed to contain legend (simpleGraph)
			*/
			function updateSimpleGraph(l)
			{	
			
			
				// update global variables
				opcty = $('#opacitySlider').slider('option', 'value');			
				needToRecalculateNumberInGrps = true;	
				var hoverValue = null;					
				hoverValue = selectedGEOUNITVariables[selectedDatasetIndex];
				var canvasArea = { width : 350, height : 200 };				
				markedPolys = [];		
				
				
				// initialise local variables
				var vbBufferTop = 5;
				var vbBufferBottom = 5;
				var vbBufferLeft = -5;
				var vbBufferRight = 60;			
				var legendBarStart = 95;
				var numLegendEntities = numColorDivs; // local variable to count number of legend band to show and therefore resize div to accommodate
				var toStr;
				var fromStr;	
				
				
				// define and build new div for containing legend	
				var div = L.DomUtil.create('simpleGraph'),
					labels = [],
					from, to, i;
					
					
				// boolean check to detemine which array of data divisions to access and use depending on what users have selected to define data limits.
				// Either standard set of divisions (contained by array 'divisions') if user has not checked ON the 'Fixed Data Ranges' checkbox, or
				// the specific set contained by array fixedDataRanges that is populated when user checks ON.
				if ( fixedValCheck == true ) { grades = fixedDataRanges; }
				else if ( customCheck == true ) { grades = customDivisions; }				
				else { grades = divisions; }
				
			
				// clear dynamic elements from old legend in advance of rebuilding it based on new user selections
				$('.toRemove').remove();
				$('.legendText').remove();
				$('#unitsLabel').remove();
				$('#labelControls').remove();
				d3.select("#simpleChart").remove();
				
				
				// append new svg area					
				d3.select("#legendSVGDiv")
					.append("svg")
					.attr("id","simpleChart")
					.attr("width", canvasArea.width)
					.attr("height", canvasArea.height)
					.on("mouseover", function() {

								
						// Fix for users of IE when the select GEOUNIT on map, and mouseout over coast line. Resets all highlighted components on map, legend and graph areas
						// to allow interaction wih next element.
						if ( previousSelection == true && highlightedGEOUNIT == false )
						{
							geojson.resetStyle(previous);
							d3.select("#geoName").remove();	  
							d3.select("#valbg").remove();
							d3.select("#rankingText1").remove();
							d3.select("#rankingText2").remove();
							d3.select("#highlightedVertBar").remove();
							d3.select("#rankGeneratedGraphHighlightBox").remove();
							d3.select("#rankGeneratedLegendHighlightBoxBorder").remove();
							
							needToRecalculateNumberInGrps = false;
							highlightedGEOUNIT = false;					  
							rankMouseOver = true;	
							hasHovered = false;							
						  
						  
							var color = getColor(ukData.features[indexOfCurrentHoverOverGEOUNIT_CD]['properties']['datavalues'][selectedDatasetIndex][selectedYearIndex], "updateSimpleGraph");
							
							
							if ( hoveredGrade != -1 )
							{
							  
								// lefthand legend box, without highlighted border
								d3.select("#simpleChart")
									.append("rect")
									.attr("class", "toRemove" )
									.attr("position", "absolute" )
									.attr("x", vbBufferLeft )
									.attr("y", 27+(18*hoveredGrade) )
									.attr("width", 16 )
									.attr("height", 16 )
									.attr("padding", 0 )
									.attr("opacity", opcty ) 							
									.attr("stroke-style", "solid" )					
									.attr("stroke-width", 0 )
									.attr("stroke", "black" )
									.attr("fill", color );	
							}
					  }
				});	
					
					
				// define sizing of SVG viewbox area for drawing legend;
				//viewbox required to ensure goegraphies with high number of areas can be contained within, and not spill off the end 								
				var viewBoxWidth = canvasArea.width - vbBufferRight - vbBufferLeft;
				var viewBoxHeight = canvasArea.height - vbBufferTop - vbBufferBottom;
				var barIntervalWidth = (viewBoxWidth - legendBarStart) / numElements;				
				d3.select("#simpleChart")
					.attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight);
					
				
				// for each grade/division band split value
				for (var i = 0; i < grades.length; i++)
				{
									
				
					band = i; // define band iteration to allow mouseover to determine which GEOUNITs should be highlighted on map and graph
					barWidth = barIntervalWidth*RangeCounts[i]; // calculate barWidth based on number of GEOUNITs contained within data band
					
					
					// define lower and upper bounds to data band being considered; 							
					from = (Number(grades[i])); 
					to = (Number(grades[i + 1]));
					toStr = to.toPrecision(3);
					
					
					// sequence of logical checks to determine content and style of 'from' and 'to' values, and formatting necessary depending on outcome								
					if ( isNaN(to) == true )
					{
						to = Infinity;
						toStr = "";
					}
					else if ( toStr < 10.0 ) { toStr = to.toFixed(2) - presentationTolerance; }
					else { toStr = to.toFixed(1) - presentationTolerance; }									
					
					fromStr = from.toPrecision(3);
					
					if ( fromStr < 10.0 ) { fromStr = from.toFixed(2); }
					else { fromStr = from.toFixed(1); }
					
					
					// define special case if division data value is minimum bound to lowest data band. Set to "-Infinity" if it is, otehrwise
					// retain grades[i] value
					if ( i == 0 ) { fromStr = -Infinity;   }
					else { fromStr = (fromStr);  }	
					
					
					// build legend text string stating data band's minimum and maximum bounds					
					if ( toStr == "" ) { legendStr = fromStr + "+"; }
					else if ( fromStr == -Infinity ) { legendStr = "<" + (toStr + presentationTolerance).toFixed(1); }
					else { legendStr = fromStr + " to " + toStr.toFixed(1); }					
					
					if ( isNaN(RangeCounts[i]) == true ) { continue; }			
					
					
					// if user has hovered over a GEOUNIT on the map layer and its selected data variable value is within the considered legend data band		
					if ( hoverValue >= from && hoverValue < to )
					{		
	
					
						// if user has hoverd over a GEOUNIT on the map layer,
						// or selected and fixed upon one by clicking on one, or selecting via the geoearch tool or 'geoUnit-drop' selection list
						if( ( hasHovered == true || highlightedGEOUNIT == true ) && selectedGEOUNITVariables[selectedDatasetIndex] != null )
						{			
											
									
							// lefthand legend box, with highlighted border, using complamentary colour from colorbrewer.js
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("id", "rankGeneratedLegendHighlightBox")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+1 )
								.attr("y", 28+(18*i) )
								.attr("width", 14 )
								.attr("height", 14 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 2 )
								.attr("stroke", getColor((grades[i]), "updateSimpleGraph") )
								.attr("fill", getColor((grades[i]), "updateSimpleGraph") );				
											
									
							// lefthand legend box, with highlighted border, using complamentary colour from colorbrewer.js
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("id", "rankGeneratedLegendHighlightBoxBorder")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+1 )
								.attr("y", 28+(18*i) )
								.attr("width", 14 )
								.attr("height", 14 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 2 )
								.attr("stroke", compColour )
								.attr("fill", "none" );																	
								
								
							// legend text string defining range minimum and maximum values
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text(legendStr)
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft + 19 )
								.attr("y", 38+(18*i) );
							
							
							// vertical highlight bar placed to left of data range count bar, using complamentary colour from colorbrewer.js
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("id", "rankGeneratedGraphHighlightBox")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+88 )
								.attr("y", 27+(18*i) )
								.attr("width", 5 )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", compColour )
								.attr("fill", compColour); 							
								
																
							// horizontal count bar scaled by number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+95 )
								.attr("y", 27+(18*i) )
								.attr("width", barWidth )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill",  getColor((grades[i]), "updateSimpleGraph") );							
								
																
							// count of number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("text")
								.attr("class", "toRemove" )
								.text(RangeCounts[i])
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+legendBarStart+barWidth+5 )
								.attr("y", 38+(18*i) ); 															
								
																
							// invisible horizontal bar overlaying individual legend band row; extends over extend of viewbox
							d3.select("#simpleChart")
								.append("rect")
								.attr("id", i )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", viewBoxWidth )
								.attr("height", 16 )
								.attr("opacity", 0.0 )
								.attr("fill", 'grey' )
								.attr("stroke", 'grey' )
								.attr("stroke-width", "0")
								.attr("shape-rendering", "geometricPrecision" )
								.on("mouseover", function() {	
									
									$('#legendSVGDiv').append('<div id="legendTip">' + '<label id="tooltipText">' + RangeCounts[this.id] + ' ' + geoUnit + ' units in selected data band</label>' + '</div>');	;	
									
									$('#legendTip').css('position', "absolute");	
//									$('#legendTip').css('left', (vbBufferLeft+90+barIntervalWidth*RangeCounts[this.id])+15 + "px");
									$('#legendTip').css('left', (vbBufferLeft)-95 + "px");
									$('#legendTip').css('top', (27+(18*this.id)) + "px");

									$('#legendTip').css('display', "inline");	
									$('#legendTip').css('z-index', "10");	
									
									$('#legendTip').show();
																		
									if ( highlightedGEOUNIT == false ) {																	
																			
										d3.select(this)
											.attr("opacity", 0.15)
											.attr("stroke-width", "0" )
											.attr("shape-rendering", "geometricPrecision" );
											
										flood_fixHighlightPoly(this.id);										
									}
										
								})
								.on("mouseout", function() {
									
									$('#legendTip').remove();									
									
									d3.select(this)
										.attr("opacity", 0.0);
										
									if ( markedPolys[this.id] )
									{
										for ( var i=0; i<markedPolys[this.id].length; i++ ) { map.removeLayer(markedPolys[this.id][i]); }
									}
								});
						}
							
							
						// if user mouseouts away from selected area, return legend row to default format (without highlighting)
						// necessary to handle 'mouse out' interactions away from map layer
						else
						{			
						
									
							// lefthand legend box, without highlighted border
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", 16 )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill",  getColor((grades[i]), "updateSimpleGraph") );																	
								
								
							// legend text string defining range minimum and maximum values
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text(legendStr)
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft + 19 )
								.attr("y", 38+(18*i) ); 							
								
																
							// horizontal count bar scaled by number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+95 )
								.attr("y", 27+(18*i) )
								.attr("width", barWidth )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill",  getColor((grades[i]), "updateSimpleGraph") );							
								
																
							// count of number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("text")
								.attr("class", "toRemove" )
								.text(RangeCounts[i])
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+legendBarStart+barWidth+5 )
								.attr("y", 38+(18*i) );															
								
																
							// invisible horizontal bar overlaying individual legend band row; extends over extend of viewbox
							d3.select("#simpleChart")
								.append("rect")
								.attr("id", i )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", viewBoxWidth )
								.attr("height", 16 )
								.attr("opacity", 0.0 )
								.attr("fill", 'grey' )
								.attr("stroke", 'grey' )
								.attr("stroke-width", "0")
								.attr("shape-rendering", "geometricPrecision" )
								.on("mouseover", function() {
									
									$('#legendSVGDiv').append('<div id="legendTip">' + '<label id="tooltipText">' + RangeCounts[this.id] + ' ' + geoUnit + ' units in selected data band</label>' + '</div>');	;	
									
									$('#legendTip').css('position', "absolute");	
//									$('#legendTip').css('left', (vbBufferLeft+90+barIntervalWidth*RangeCounts[this.id])+15 + "px");
									$('#legendTip').css('left', (vbBufferLeft)-95 + "px");
									$('#legendTip').css('top', (27+(18*this.id)) + "px");

									$('#legendTip').css('display', "inline");	
									$('#legendTip').css('z-index', "10");	
									
									$('#legendTip').show();
																		
									if ( highlightedGEOUNIT == false ) {																	

										d3.select(this)
											.attr("opacity", 0.15)
											.attr("stroke-width", "0" )
											.attr("shape-rendering", "geometricPrecision" );

										var Band = "Band_" + this.id;
	
										d3.selectAll(".Band_" + this.id)
											.attr("fill", compColour)
											.attr("stroke", compColour )
											.attr("stroke-width", "0")
											.attr("opacity",1.0)
											.attr("y", 255)
											.attr("height", 10);
											
										flood_fixHighlightPoly(this.id);
										
										d3.select('#valbg').remove();
										d3.select('#rankingText1').remove();
									}
										
								})
								.on("mouseout", function() {
									
									$('#legendTip').remove();									
									
									d3.selectAll(".Band_" + this.id)
										.attr("opacity",0.0)
										.attr("y", glblHghlghtBarTop)
										.attr("height", glblHghlghtBarHgt);									
																		
									d3.select(this)
										.attr("opacity", 0.0);			
				
									if ( markedPolys[this.id] )
									{
										for ( var i=0; i<markedPolys[this.id].length; i++ ) { map.removeLayer(markedPolys[this.id][i]); }
									}
								});

								filterRangeGeoUnits(0, i, from, to);
						}
					}
					
					
					// otherwise, if user has not hovered over the value being considered. Necessary to draw majority of legend on 'onload'
					else
					{				
						
									
							// lefthand legend box, without highlighted border
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", 16 )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill",  getColor((grades[i]), "updateSimpleGraph") );																	
								
								
							// legend text string defining range minimum and maximum values
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text(legendStr)
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft + 19 )
								.attr("y", 38+(18*i) );							
								
																
							// horizontal count bar scaled by number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+95 )
								.attr("y", 27+(18*i) )
								.attr("width", barWidth )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill",  getColor((grades[i]), "updateSimpleGraph")  );							
								
																
							// count of number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("text")
								.attr("class", "toRemove" )
								.text(RangeCounts[i])
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+legendBarStart+barWidth+5 )
								.attr("y", 38+(18*i) ); 													
								
																
							// invisible horizontal bar overlaying individual legend band row; extends over extend of viewbox
							d3.select("#simpleChart")
								.append("rect")
								.attr("id", i )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", viewBoxWidth+15 )
								.attr("height", 16 )
								.attr("opacity", 0.0 )
								.attr("fill", 'grey' )
								.attr("stroke", 'grey' )
								.attr("stroke-width", "0")
								.attr("shape-rendering", "geometricPrecision" )
								.on("mouseover", function() {
									
									$('#legendSVGDiv').append('<div id="legendTip">' + '<label id="tooltipText">' + RangeCounts[this.id] + ' ' + geoUnit + ' units in selected data band</label>' + '</div>');	;	
									
									$('#legendTip').css('position', "absolute");	
//									$('#legendTip').css('left', (vbBufferLeft+90+barIntervalWidth*RangeCounts[this.id])+15 + "px");
									$('#legendTip').css('left', (vbBufferLeft)-95 + "px");
									$('#legendTip').css('top', (27+(18*this.id)) + "px");

									$('#legendTip').css('display', "inline");	
									$('#legendTip').css('z-index', "10");	
									
									$('#legendTip').show();
																		
									if ( highlightedGEOUNIT == false ) {									
																			
										d3.select(this)
											.attr("opacity", 0.15)
											.attr("stroke-width", "0" )
											.attr("shape-rendering", "geometricPrecision" );										
										
										var Band = "Band_" + this.id;
																				
										d3.selectAll(".Band_" + this.id)
											.attr("fill", compColour)
											.attr("stroke", compColour )
											.attr("stroke-width", "0")
											.attr("opacity",1.0)
											.attr("y", 255)
											.attr("height", 10);
											
										flood_fixHighlightPoly(this.id);
										
										d3.select('#valbg').remove();
										d3.select('#rankingText1').remove();
									}
										
								})
								.on("mouseout", function() {
									
									$('#legendTip').remove();									
									
									d3.selectAll(".Band_" + this.id)
										.attr("opacity",0.0)
										.attr("y", glblHghlghtBarTop)
										.attr("height", glblHghlghtBarHgt);							
																		
									d3.select(this)
										.attr("opacity", 0.0);			
				
									if ( markedPolys[this.id] )
									{
										for ( var i=0; i<markedPolys[this.id].length; i++ ) { map.removeLayer(markedPolys[this.id][i]); }
									}
								});	

							filterRangeGeoUnits(0, i, from, to);	
					}
				}
				
				
				// if any null values have been detected in 'danulledGEOUNITCountta.js' these HTML components need to be built, and appended onto base of legend
				if ( nullValue == true )
				{
					
					
					// define specific bar width based on value contained in array 'nulledGEOUNITCount'
					barWidth = barIntervalWidth*nulledGEOUNITCount[selectedDatasetIndex][selectedYearIndex];
										
										
					//	if user has hovered or selected a GEOUNIT area using mouse, geosearch tool or 'geoUnit-drop' selection list
					if( ( hasHovered == true || highlightedGEOUNIT == true ) && selectedGEOUNITVariables[selectedDatasetIndex] == null )
					{		
						
									
							// lefthand legend box, with highlighted border, using complamentary colour from colorbrewer.js
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("id", "rankGeneratedLegendHighlightBox")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+1 )
								.attr("y", 28+(18*i) )
								.attr("width", 14 )
								.attr("height", 14 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 2 )
								.attr("stroke", "#CCC" )
								.attr("fill", "#CCC");		
						
									
							// lefthand legend box, with highlighted border, using complamentary colour from colorbrewer.js
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("id", "rankGeneratedLegendHighlightBoxBorder")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+1 )
								.attr("y", 28+(18*i) )
								.attr("width", 14 )
								.attr("height", 14 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 2 )
								.attr("stroke", compColour )
								.attr("fill", "none");
								
 							
							// legend text string defining range minimum and maximum values
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text("No data")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft + 19 )
								.attr("y", 38+(18*i) );
							
							
							// vertical highlight bar placed to left of data range count bar, using complamentary colour from colorbrewer.js
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("id", "rankGeneratedGraphHighlightBox")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+88 )
								.attr("y", 27+(18*i) )
								.attr("width", 5 )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", compColour )
								.attr("fill", compColour );								
								
																
							// horizontal count bar scaled by number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+95 )
								.attr("y", 27+(18*i) )
								.attr("width", barWidth )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill", "#CCC" );							
								
																
							// count of number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text( nulledGEOUNITCount[selectedDatasetIndex][selectedYearIndex] )
								.attr("position", "absolute" )								
								.attr("x", vbBufferLeft+legendBarStart+barWidth+5 )
								.attr("y", 38+(18*i) ); // GEOUNIT Count figure ...  								
					}
					
					
					// default state with no highlighting on the legend
					else
					{			
						
									
							// lefthand legend box, without highlighted border
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", 16 )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill", "#CCC");																	
								
								
							// legend text string defining range minimum and maximum values
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text("No data")
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft + 19 )
								.attr("y", (38+(18*i)) ); 							
								
																
							// horizontal count bar scaled by number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("rect")
								.attr("class", "toRemove" )
								.attr("position", "absolute" )
								.attr("x", vbBufferLeft+95 )
								.attr("y", 27+(18*i) )
								.attr("width", barWidth )
								.attr("height", 16 )
								.attr("padding", 0 )
								.attr("opacity", opcty ) 							
								.attr("stroke-style", "solid" )					
								.attr("stroke-width", 0 )
								.attr("stroke", "black" )
								.attr("fill", "#CCC");							
								
																
							// count of number of GEOUNITs in data range
							d3.select("#simpleChart")
								.append("text")
								.attr("class","legendText")
								.text( nulledGEOUNITCount[selectedDatasetIndex][selectedYearIndex] )
								.attr("position", "absolute" )								
								.attr("x", vbBufferLeft+legendBarStart+barWidth+5 )
								.attr("y", 38+(18*i) );														
								
																
							// invisible horizontal bar overlaying individual legend band row; extends over extend of viewbox
							d3.select("#simpleChart")
								.append("rect")
								.attr("id", i )
								.attr("x", vbBufferLeft )
								.attr("y", 27+(18*i) )
								.attr("width", viewBoxWidth+15 )
								.attr("height", 16 )
								.attr("opacity", 0.0 )
								.attr("fill", 'grey' )
								.attr("stroke", 'grey' )
								.attr("stroke-width", "0")
								.attr("shape-rendering", "geometricPrecision" )
								.on("mouseover", function() {							
									
									$('#legendSVGDiv').append('<div id="legendTip">' + '<label id="tooltipText">' + nulledGEOUNITCount[selectedDatasetIndex][selectedYearIndex] + ' ' + geoUnit + ' units in selected data band</label>' + '</div>');	;	
									
									$('#legendTip').css('position', "absolute");	
//									$('#legendTip').css('left', (vbBufferLeft+90+barIntervalWidth*RangeCounts[this.id])+15 + "px");
									$('#legendTip').css('left', (vbBufferLeft)-95 + "px");
									$('#legendTip').css('top', (27+(18*this.id)) + "px");

									$('#legendTip').css('display', "inline");	
									$('#legendTip').css('z-index', "10");	
									
									$('#legendTip').show();
																		
									if ( highlightedGEOUNIT == false ) {d3.select(this)
											.attr("opacity", 0.15)
											.attr("stroke-width", "0" )
											.attr("shape-rendering", "geometricPrecision" );
										
										var Band = "Band_" + this.id;
										
										d3.selectAll(".Band_" + this.id)
											.attr("fill", compColour)
											.attr("stroke", compColour )
											.attr("stroke-width", "0")
											.attr("opacity",1.0)
											.attr("y", 255)
											.attr("height", 10);
											
										flood_fixHighlightPoly(this.id); // problem
										
										d3.select('#valbg').remove();
										d3.select('#rankingText1').remove();
									}
								})
								.on("mouseout", function() {
									
									$('#legendTip').remove();									
									
									d3.selectAll(".Band_" + this.id)
										.attr("opacity",0.0)
										.attr("y", glblHghlghtBarTop)
										.attr("height", glblHghlghtBarHgt);								
																		
									d3.select(this)
										.attr("opacity", 0.0);			
				
									if ( markedPolys[this.id] )
									{
										for ( var i=0; i<markedPolys[this.id].length; i++ ) { map.removeLayer(markedPolys[this.id][i]); }
									}
								});	

							filterRangeGeoUnits(-1, i, from, to);			
					}
					
					
					numLegendEntities++;	
				}								
				
				
				// append legend label and setting button to Div
				$('#legendSVGDiv').append('<label id="unitsLabel">' + variableUnitLegend[selectedDatasetIndex] + '</label>');				
				$('#legendSVGDiv').append("<a href=" + "'javascript:showControls()' " + 'id="labelControls" title="Settings"></a>');
				
				
				// modify div dimensions based on number of legend rows
				var divheight = (18*numLegendEntities)-10;
				document.getElementById("legendSVGDiv").style.height = divheight + "px";	
									
				hoverValue = null;		
		
				return div;		
							
			}// end updateSimpleGraph()
						
			
				
			/*
				NAME: 			filterRangeGeoUnits
				DESCRIPTION: 	populates array of geoJSON polygon objects based on which data band on the legend they fall into.
								Array allows all polygons to be highlighted that are contained within grade[]/diovisions band hovered over by user
				CALLED FROM:	updateSimpleGraph
				CALLS:			n/a	
 				REQUIRES: 		nullCheck - local variable passed to this function to denote if it is called from user hovering over a true data band or the 'No Data' band on legend (either 0 or -1)
								num - integer; denotes data band user has hovered over on legend and therefore which data band of array 'markedPolys[num]' to push geoJSON polygon into
								fromVal - lower bound for grade[i]/division]i] data band (numeric/float)
								toVal - lower bound for grade]i]/division]i] data band (numeric/float)
				RETURNS: 		n/a
			*/
			function filterRangeGeoUnits(nullCheck, num, fromVal, toVal)
			{		
			
			
				// create local variables	
				var legendPolygon;
			
			
				// for each GEOUNIT element listed in data.js
				for(var i=0; i<numElements; i++)
				{
					
					// certain conditions arise
					if ( /*( nullCheck == -1 && ukData.features[i].properties.datavalues[selectedDatasetIndex][selectedYearIndex] == null ) ||*/
						 ( nullCheck != -1 && ukData.features[i].properties.datavalues[selectedDatasetIndex][selectedYearIndex] != null ) &&
						 ( nullCheck == 0 && ukData.features[i].properties.datavalues[selectedDatasetIndex][selectedYearIndex] >= fromVal &&
						 	ukData.features[i].properties.datavalues[selectedDatasetIndex][selectedYearIndex] < toVal ) )
					{	
					
					
						// pick out geometry information from data.js for GEOUNIT selected through iteration
						geomType = ukData.features[i].geometry;
						
	
						 // define new polygon and CSS attribution for highlight  polygon
						 // solid fill, no outline. Used to highlight polygons in the grade range over which user has hovered in LOWER RIGHT legend ...
						legendPolygon = new L.GeoJSON(geomType);
						legendPolygon.setStyle({
							weight: 0,
							color: compColour,
							dashArray: '',
							fillOpacity: 0.75,
							opacity: 1.0
						});
	
	
						// if sub array of markedPolys array is not yet defined
						if ( typeof markedPolys[num] === 'undefined' ) { markedPolys[num] = new Array(); }
	
	
						// push new polygon onto markedPolys subu array
						markedPolys[num].push(legendPolygon);
						
					}
					
					
					// else if user hovers over null band in legend 
					else if ( ( nullCheck == -1 && ukData.features[i].properties.datavalues[selectedDatasetIndex][selectedYearIndex] == null ) ) 
					{					
					
						// pick out geometry information from data.js for GEOUNIT selected through iteration
						geomType = ukData.features[i].geometry;
						
	
						 // define new polygon and CSS attribution for highlight  polygon
						 // solid fill, no outline. Used to highlight polygons in the grade range over which user has hovered in LOWER RIGHT legend ...
						legendPolygon = new L.GeoJSON(geomType);
						legendPolygon.setStyle({
							weight: 0,
							color: compColour,
							dashArray: '',
							fillOpacity: 0.75,
							opacity: 1.0
						});
	
	
						// if sub array of markedPolys array is not yet defined
						if ( typeof markedPolys[num] === 'undefined' ) { markedPolys[num] = new Array(); }
	
	
						// push new polygon onto markedPolys subu array
						markedPolys[num].push(legendPolygon);						
						
					}
					
					
					// else do nothing
					else
					{	
							// else do nothing				
					}
				}
				
				
			}//end filterRangeGeoUnits(nullCheck, num, fromVal, toVal)	
						
			
				
			/*
				NAME: 			showControls 
				DESCRIPTION: 	reveals 'display Controls' modal dialog contianing resources to change map/graph/legend display
				CALLED FROM:	user interaction with 'Settings' button on main UI
				CALLS:			n/a	
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function showControls()
			{	
			
			
				// modify CSS attibution to show modal Display Controls dialog
				$("#dialogDisplayControls").dialog({ modal: true });
				$("#dialogDisplayControls").dialog({ show: 0 });	
				$("#dialogDisplayControls").dialog( "option", "height", 325 );
				$("#dialogDisplayControls").dialog( "option", "width", 250 );		
				$("#dialogDisplayControls").dialog( "option", "position", [200, 200] );
				$("#dialogDisplayControls").dialog({ resizable: false });
			
				
			}// end showControls()	
						
			
				
			/*
				NAME: 			hideEmbedDiv 
				DESCRIPTION: 	hides 'embed' dialog from user view
				CALLED FROM:	user interaction with 'X' button 'embed' dialog
				CALLS:			n/a	
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function hideEmbedDiv()
			{		
			
			
				// hide embed Div
				$(".embedDiv").hide(400);
				
				
			}// end hideEmbedDiv()	
						
			
				
			/*
				NAME: 			changeDivisionsEqualIntervals 
				DESCRIPTION: 	determines data splits using Equal Interval splitting logic
				CALLED FROM:	simplegraph
				CALLS:			findGlobalMax
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function changeDivisionsEqualIntervals()
			{
				
				
				// ensure selection list and relaed boolean variable to chose number of divisions required is available to use if 'custom' split type has been selection before hand
				$( "#divisions-drop" ).prop( "disabled", false ); 
				customCheck = false;		
			
			
				// grab values for time slider and store as global variables
				startYear = $('#timeSlider').slider( "option", 'min' );		
				yearInterval = $('#timeSlider').slider(  "option", "step" );			
				selectedYear = $('#timeSlider').slider(  "option", 'value');
				selectedYearIndex = ( selectedYear - startYear ) / yearInterval;
	
						
				// initialise local variables
				divisions = [];	
				var DivSize = 0;
				var stuffDivisionsArray = "";
				var selectedDatasetRangeDiff = 0;				
				var calculateSelectedDatasetRangeDiff;
				var calculateDivSize;
				needToRecalculateNumberInGrps = true;
				
				
				// initial local variables to store maximum data values from global arrays stuffed from content of 'data.js'
				var maxArray = arrayMaxNames[selectedDatasetIndex];	
				var minArray = arrayMinNames[selectedDatasetIndex];
				
				
				// call function to determine min and max values
				findGlobalMax();
				
				
				// if max and min values are to be determined from all years of the same dataset variable					
				if ( document.getElementById('range-drop').value == "Within year" )
				{
					
					
					// make necessary calculations
					calculateSelectedDatasetRangeDiff = "selectedDatasetRangeDiff = (parseFloat(" + maxArray + "[" + selectedYearIndex + "]) - parseFloat(" + minArray + "[" + selectedYearIndex + "])).toFixed(2)";					
					calculateDivSize = "DivSize = selectedDatasetRangeDiff / numColorDivs";							
				}
				else
				{
					
					
					// make necessary calculations
					calculateSelectedDatasetRangeDiff = "selectedDatasetRangeDiff = (" + globalMax + " - " + globalMin + ").toFixed(2)";
					calculateDivSize = "DivSize = selectedDatasetRangeDiff / numColorDivs";	
				}
				
				
				// process string commands				
				eval(calculateSelectedDatasetRangeDiff);
				eval(calculateDivSize);
				
				
				// for the number of divisions specified by the user				
				for (var i=0; i<numColorDivs; i++ )
				{
					
					
					// this is the first iteration (special case)
					if ( i == 0 )
					{
						if ( document.getElementById('range-drop').value == "Within year" ) { stuffDivisionsArray = "divisions[" + i + "] = parseFloat(" + minArray + "[" + selectedYearIndex + "]).toFixed(2)"; }
						else { stuffDivisionsArray = "divisions[" + i + "] = (" + globalMin + ").toFixed(2)"; }
						
						eval(stuffDivisionsArray);						
						
						
						// skip to next iteration without completing iteration
						continue;
					}
					
					
					// otherwise process on all other itertations
					stuffDivisionsArray = "divisions[" + i + "] = Number(parseFloat(divisions[" + i + "-1]) + parseFloat(" + DivSize + "))";
					eval(stuffDivisionsArray);		
					
				}// end 'for' loop...
				
				
				return;
				
			
			}//end changeDivisionsEqualIntervals()	
						
			
				
			/*
				NAME: 			changeDivisionsQuantiles 
				DESCRIPTION: 	determines data splits using Quantiles splitting logic
				CALLED FROM:	simplegraph
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function changeDivisionsQuantiles()
			{
				
				
				// ensure selection list and relaed boolean variable to chose number of divisions required is available to use if 'custom' split type has been selection before hand
				$( "#divisions-drop" ).prop( "disabled", false ); 
				customCheck = false;		
			
			
				// create store array if it currently is not defined
				if ( divisions != undefined ) { divisions = []; }
				
				
				// initial variables
				var tempArray = new Array();
				var isArrayOddOrEvenlength; // even = 0; odd = 1;
				var trueQuantileValue;	
				var mainArray;
				var subArray;
				var arrayStr;
				var checkArrayLengthStr;			
				
				
				// update variables
				needToRecalculateNumberInGrps = true;
				startYear = $('#timeSlider').slider( "option", 'min' );		
				yearInterval = $('#timeSlider').slider(  "option", "step" );	
				selectedYear = $('#timeSlider').slider(  "option", 'value');
				selectedYearIndex = ( selectedYear - startYear ) / yearInterval;					
				
				
				// if max/min data values are required from the currently considered year				
				if ( document.getElementById('range-drop').value == "Within year" )
				{
					mainArray = arrayNames[selectedDatasetIndex];
					subArray = mainArray + "[" + selectedYearIndex + "]";
					checkArrayLengthStr = subArray + ".length%2 == 0";	
				}
											
				
				// if max/min data values are required from across all years on teh selected dataset for which data is provided				
				else if ( document.getElementById('range-drop').value == "Across years" )
				{
					
					
					// construct string to ultimately process to concatenate all year arrays to one single array to determine
					// global min/max values across all years on a given dataset
					var i = 0;
					mainArray = arrayNames[selectedDatasetIndex];
					subArray = mainArray + "[" + i + "].concat(";
					
					
					// for each year for which data is provided in time-series dataset					
					for( var i=1; i<subDataArrayLength-1; i++ ) // i = year index
					{


						// construct text string for each iteration except the final one
						mainArray = arrayNames[selectedDatasetIndex];
						arrayStr = mainArray + "[" + i + "],";
						subArray = subArray + arrayStr;						
					}
					
	
					// for final iteration
					arrayStr = mainArray + "[" + i + "])";
					subArray = subArray + arrayStr;
					checkArrayLengthStr = subArray + ".length%2 == 0";
				}					
				
				
				// define if array has odd or even number of elements
				if ( eval(checkArrayLengthStr) ) { isArrayOddOrEvenlength = 0; }			
				else                             { isArrayOddOrEvenlength = 1; }
				
				
				// make exact copy of data array
				var sliceArrayStr = "tempArray = " + subArray + ".slice()";
				eval(sliceArrayStr);
				
				
				// sot ascending temporary data array
				tempArray.sort(function(a,b){return a-b});
								 
								 
				// for number of divisions required by user
				for ( var i=0; i<numColorDivs; i++ )
				{	
				
				
					// define which quantile you requrie to calculate 
					var quantileRank = tempArray.length * (i/numColorDivs);
							
					
					// for first iteration		
					if ( i != 0 && quantileRank % 1 === 0 && isArrayOddOrEvenlength == 0 )
					{										
						var lowVal = tempArray[quantileRank];
						var highVal = tempArray[quantileRank+1];
						trueQuantileValue = (lowVal+highVal)/2;	
					}
					
					
					// for all other iterations				
					else
					{					
						quantileRank = Math.ceil(quantileRank);
						trueQuantileValue = tempArray[quantileRank];	
					}
					
					
					divisions[i] = parseFloat(trueQuantileValue).toFixed(2);
				}
					
				return;
				
				
			}//end changeDivisionsQuantiles()
						
			
				
			/*
				NAME: 			changeDivisionsQuantiles 
				DESCRIPTION: 	determines data splits using Natural Jenks splitting logic
				CALLED FROM:	simplegraph
				CALLS:			ss.jenks
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function changeDivisionsJenks()
			{
				
				
				// ensure selection list and relaed boolean variable to chose number of divisions required is available to use if 'custom' split type has been selection before hand
				$( "#divisions-drop" ).prop( "disabled", false ); 
				customCheck = false;		
			
			
				// initialise a temporary array to store copy of main data array
				var tempArray = [];				
				
				
				// construct text string to extract GEOUNIT data baed on selected year and dataset
				var mainArray = arrayNames[selectedDatasetIndex];
				var subArray = mainArray + "[" + selectedYearIndex + "]";
				
				
				// if user requires min/max range values extracted from year currently selected  
				if ( document.getElementById('range-drop').value == "Within year" )
				{						
					mainArray = arrayNames[selectedDatasetIndex];
					subArray = mainArray + "[" + selectedYearIndex + "]";
				}
				
				
				// other wise user wants max/min range values from across all years for the same dataset
				else if ( document.getElementById('range-drop').value == "Across years" )
				{					
				
				
					if ( NJbreaks.length > 0 )
					{						
						divisions = NJbreaks[selectedDatasetIndex][numColorDivs];
						return;
					}

				
					// construct text string to evaluate to concatenate all year arrays into one single array
					var i = 0;
					mainArray = arrayNames[selectedDatasetIndex];
					subArray = mainArray + "[" + i + "].concat(";
					
					
					// for each iteration except the last
					for( var i=1; i<subDataArrayLength-1; i++ ) // i = year index
					{
						mainArray = arrayNames[selectedDatasetIndex];
						arrayStr = mainArray + "[" + i + "],";
						subArray = subArray + arrayStr;
					}
					
					
					// for the last iteration
					arrayStr = mainArray + "[" + i + "])";
					subArray = subArray + arrayStr;
					checkArrayLengthStr = subArray + ".length%2 == 0";

				}
				
				
				// make exact local copy of the data array to work with						
				var tempArrayStr = "tempArray = " + subArray + ".slice()";					
				eval(tempArrayStr);
				
				
				// sort local temporary copy of data array
				var mainArraySorted =  "tempArray.sort(function(a,b){return a-b})";	
					
				
				// calculate jenks breaks using library
				ss.jenks(eval(mainArraySorted), numColorDivs);	
				
				
				// nullify all arrays before exiting
				tempArray = [];
				subArray = [];
				mainArray = [];	
				
				return;
				
				
			}//end changeDivisionsJenks()
						
			
				
			/*
				NAME: 			changeDivisionsQuantiles 
				DESCRIPTION: 	determines data splits using Natural Jenks splitting logic
				CALLED FROM:	simplegraph
				CALLS:			ss.jenks
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function changeDivisionsCustom()
			{
				customCheck = true;
				
				//var numCustomDivsions = customDivisions.length;
				var numDivDrop = document.getElementById('divisions-drop');
				numDivDrop.value = customDivisions.length;
				$( "#divisions-drop" ).prop( "disabled", true );
				
				grades = customDivisions;
				
				return;
				
			}// end changeDivisionsCustom()
						
			
				
			/*
				NAME: 			stuffArrays
				DESCRIPTION: 	Maion array for stuffing data variable content of data.js into usable data arrays for tuse through the program. Accessed when user changes geographic or data selection,
								or data split definitions
				CALLED FROM:	$(document).ready
				CALLS:			sortForMaxMin
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function stuffArrays()
			{	
			
			
				// initialise local variables
				var MainArray = "";
				var tempVal = 0;
			
			
				// Loop through ukData multi-dimension data array.
				// Pick out values for the four forms of unpaid care.	
				// cycles through each GEOUNIT array
				for( var key in ukData )
				{	
				
					// determine number of geography units contained in 'data.js'
					numElements = ukData[key].length;
					
					
					// if considered feature is an ojbect
					if(typeof ukData[key] === "object")
					{	
					
						// For each feature (i.e. each GEOUNIT) in ukData ... 
						for( var i = 0 ; i < numElements; i++ ) 
						{	
						
						
							// store the number of datasets loaded for that feature/GEOUNIT.
							// Use this number determine number of global arrays to build and access to store data variables.
							NumberOfDataSets = ukData.features[i].properties.datavalues.length;				
							arrayNames.length = NumberOfDataSets;
							
							
							// For each sub-array in feature's main data array ("datavalues") ...
							// j defines which data set is being accessed
							for ( var j = 0 ; j < NumberOfDataSets; j++ ) 
							{							
							
							
								// build text string to evaluate the main data array, and check that it is undefined (does not exist)
								MainArray = arrayNames[j];
								var buildMainArray = MainArray + " = new Array()";																				
								var checkForMainArray = "typeof " + MainArray + " === 'undefined'";					
							
							
								// main array does not currently exist, build it.
								// Also build related minArray and maxArray objects
								if ( eval(checkForMainArray) )
								{
									eval(buildMainArray);
										
									var MinArray = arrayMinNames[j];
									var buildMinArray = MinArray + " = new Array()";
									eval(buildMinArray);
							
									var MaxArray = arrayMaxNames[j];
									var buildMaxArray = MaxArray + " = new Array()";
									eval(buildMaxArray);					
								}
								
								
								// determine and store number of elements (i.e. years) to each dataset for the considered feature/GEOUNIT			
								subDataArrayLength = ukData.features[i].properties.datavalues[j].length;
										
										
								// for each element/k (i.e. YEAR) in each sub-array ...
								for ( var k = 0 ; k < subDataArrayLength; k++ )
								{
									
									
									// build check to determine if subarray is needed to be appended as a subarray for each year onto the main array for each object
									buildSubArray = MainArray + "[" + k + "]";						
									var checkforSubArray = "typeof " + buildSubArray + " === 'undefined'";
			
			
									// if check proves array does not currently exist, build it
									if ( eval(checkforSubArray) )
									{
										buildSubArray = MainArray + "[" + k + "] = new Array(ukData[key].length)";
										eval(buildSubArray);
									}
									
									
									/*
									i = GEOUNIT/feature
									j = Number of datasets (data arrays)
									k = Number of years (elements within data arrays)
									*/
																											
									// decide which storage data array to push it into
									// this needs to be set to 'j', not 'k' as this if/else considers which dataset array to push value into ...						
									// if considered value is a true numeric data value
									if( ukData.features[i].properties.datavalues[j][k] !== null )
									{	
										var stuffMainArray = MainArray + "[" + k + "][" + i + "] = ukData.features[" + i + "].properties.datavalues[" + j + "][" + k + "]";
										eval(stuffMainArray);
										
										continue;
									}
									
									
									// otherwise it must be null/undefined, and so need to highlight these instances occur in dataset for consideration when building legend
									else if( ukData.features[i].properties.datavalues[j][k] === null ) 
									{
										nullValue = true;
									}
								}
							}
							
							
							// populate arrays to  contain gegrapjhy unit code and name in order they are listed in 'data.js'													
							GEOUNIT_Code[i] = ukData.features[i].properties.GEOUNIT_CD;
							GEOUNIT_Name[i] = ukData.features[i].properties.GEOUNIT_NM;
						}
					}
				}
				
				
				// calculate end year of datsets considered to allow application titles to be updated and finalised.
				endYear = startYear + ((subDataArrayLength-1)*yearInterval);		
				
				
				// call function to determine min/max values
				sortForMaxMin();
				
									
			}//end stuffArrays()
						
			
				
			/*
				NAME: 			sortForMaxMin
				DESCRIPTION: 	Determines maximum and minimum data value for each dataset and stores these into specifically named array structures
				CALLED FROM:	stuffArrays
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function sortForMaxMin()
			{	
	
			
				// initial local variables
				var MainArray = "";
				var i = 0;
				var j = 0;
				var k = 0;
				
				
				// set global arrays used to count number of effective/usaable geogreaphy units and 
				// number of unusable (areas with null values) areas					
				EffectiveGEOUNITCount.length = NumberOfDataSets;
				nulledGEOUNITCount.length = NumberOfDataSets;
							
							
				// for each dataset ...							
				for ( j=0; j<NumberOfDataSets; j++)
				{	
				
				
					// build new variables to contain specific array name to work with based on data set number
					MainArray = arrayNames[j];
					var MinArray = arrayMinNames[j];
					var MaxArray = arrayMaxNames[j];				
					
										
					// build new arrays and set lengths based on number of datasets to store counts of usable and unusable geography units
					EffectiveGEOUNITCount[j] = new Array();	
					EffectiveGEOUNITCount[j].length = NumberOfDataSets;					
					nulledGEOUNITCount[j] = new Array();
					nulledGEOUNITCount[j].length = NumberOfDataSets;
								

					// for each year ...
					for ( k=0; k<subDataArrayLength; k++ )
					{	
					
					 
						// create and build new sub-array to each new main array based on number of years in sub-arrays
						EffectiveGEOUNITCount[j][k] = subDataArrayLength;
						EffectiveGEOUNITCount[j][k] = numElements;
						
						nulledGEOUNITCount[j][k] = subDataArrayLength;
						nulledGEOUNITCount[j][k] = 0;		
						
						
						// for each GEOUNIT ...
						for ( i=0; i<numElements; i++ )
						{	
	
						
							// build strng to determine if mainArray's sub aray is currently defined
							var checkArrayElement = MainArray + "[" + k + "][" + i + "] == null";				
							
							
							// if check is true, do relevant additions/subtractions based on data value
							if 	( eval(checkArrayElement) )
							{
								EffectiveGEOUNITCount[j][k]--;
								nulledGEOUNITCount[j][k]++;
								
								continue;
							}
							
							
							
							// build string to determine if current value is less than/greater than current stored max/min values for dataset/data year combination
							var copyMainArrayElementStr = "var Val = " + MainArray + "[" + k + "][" + i + "]";
							eval(copyMainArrayElementStr);
							
							var checkMinStr1 = "!(Val >= " + MinArray + "[" + k + "])";
							var checkMinStr2 = MinArray + "[" + k + "] = Val";
							
							var checkMaxStr1 = "!(Val <= " + MaxArray + "[" + k + "])";
							var checkMaxStr2 = MaxArray + "[" + k + "] = Val";				
							
													
							// execute check strings
							if ( eval(checkMinStr1) ) { eval(checkMinStr2); }
							if ( eval(checkMaxStr1) ) { eval(checkMaxStr2); }				
						}	
					}
				}
							
							
			}//end sortForMaxMin()
						
			
				
			/*
				NAME: 			findGlobalMax
				DESCRIPTION: 	Determines maximum and minimum data value across each dataset across all years. Requried if user selects 'Across years' on 'range-drop' selection list
				CALLED FROM:	changeDivisionsEqualIntervals
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function findGlobalMax()
			{
				
				
				// construct string to make direct copy of min/max arrays
				var copyMinArray = arrayMinNames[selectedDatasetIndex] + ".slice()";
				var copyMaxArray = arrayMaxNames[selectedDatasetIndex] + ".slice()";
				eval(copyMinArray);
				eval(copyMaxArray);
				
				
				// construct and execute strings to sort and determine min/max values for global arrays (to use when user has selected "across years' on 'range-drop'
				var MinValueOfArray = "globalMin = (" + copyMinArray + ".sort(function(a,b){return a-b}))[0]";
				var MaxValueOfArray = "globalMax = (" + copyMaxArray + ".sort(function(a,b){return b-a}))[0]";				
				eval(MinValueOfArray);
				eval(MaxValueOfArray);						
  
			}// end function findGlobalMax()
						
			
				
			/*
				NAME: 			drawTimeSeries
				DESCRIPTION: 	Deconstructs URL for the current display into component elements to allow iFrame strings for embedding and posting to Twitter/FB to be built
				CALLED FROM:	reint
								redrawUI
								selectGEOUNIT
								highlightFeature
								resetHighlight
				CALLS:			getColor
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function drawTimeSeries()
			{		
			
			
				// initialise canvas area for drawing graphs on
				var canvasArea = { width : 365, height : 300 };
				var margin = { left : 15 , right : 5 , top : 15 , bottom : 5 };
				var xAxis = { xStart : 30 , xEnd : 310 , yStart : 250 , yEnd : 250 };
				var yAxis = { xStart : 30 , xEnd : 30 , yStart : 250 , yEnd : 30 };						
					
					
				// initialise local temporary array names for handling data and other local variables
				var tempArray = [];
				var tempSubArray = [];							
				var tickFrequency = 1;
				var MaxValToUse = -1;
				var yearOfMax = -1;	
				var MaxVal = -1;
				var isBuildingRect = false;
				var band = numColorDivs;
				var patt1=new RegExp(",,");
				var selectedGEOUNITVariablesStr = selectedGEOUNITVariables.toString();		
				var checkTest = patt1.test(selectedGEOUNITVariablesStr);
				
				
				// determine new values and update global variables from selection lists and sliders
				needToRecalculateNumberInGrps = false;
				selectedDatasetIndex = drop.indexOf(document.getElementById("dv-drop").value);	
				var usableGEOUNITCount = EffectiveGEOUNITCount[selectedDatasetIndex][selectedYearIndex];
				indexOfCurrentHoverOverGEOUNIT_CD = GEOUNIT_Code.indexOf(currentHoverOverGEOUNIT_CD);
				indexOfCurrentHoverOverGEOUNIT_NM = GEOUNIT_Name.indexOf(currentHoverOverGEOUNIT_NM);				
				startYear = $('#timeSlider').slider( 'option', 'min' );		
				yearInterval = $('#timeSlider').slider( 'option', 'step' );
				selectedYear = $('#timeSlider').slider( 'option',  'value' );
				selectedYearIndex = (selectedYear - startYear)/yearInterval;
				
				
				// determine frequency of tick marking on graphs based on number of geography units lsited in 'data.js'
				if ( numElements >= 0 ) { tickFrequency = 1; }
				if ( numElements >= 50 ) { tickFrequency = 5; }
				if ( numElements >= 100 ) { tickFrequency = 10; }
				if ( numElements >= 250 ) { tickFrequency = 25; }
				if ( numElements >= 500 ) { tickFrequency = 50; }		
				
								
				// remove old D3 graph elements in advance of drawing new ones based on new user selections				
				d3.select("#mainChart").remove();
				d3.select("#geoName").remove();
				
				
				// redraw new canvas area for graphing statistics
				d3.select("#graphSVGDiv")
					.append("svg")
					.attr("id","mainChart")
					.attr("width", canvasArea.width)
					.attr("height", canvasArea.height)
					.append("g")				
					.attr("id","mainChart");
					
				
				// Default starting position for graph area (top-right of frame). Also entered if user mouseover's an area ... 
				// graphing area opens up to ranking graph, and returns to this graph when user is NOT interacting with map layer,
				// and will remain as ranking graph if user selects other option from 'graph-drop' until user interacts with map/geosearch tool/area selection list
				if ( ( hasHovered == false && highlightedGEOUNIT == false ) || ( ( hasHovered == true || highlightedGEOUNIT == true ) && graphType=="Rank" ) )
				{				
					
				
					// 	initialise local variables
					var tempNullGEOUNITListing = new Array();
					var tempGEOUNITListing = new Array();
					var GEOUNITValueObj = {}; //create object containing key(geoName):value(value) pairs' disciminates beween usuable values and unusable/null values							
					var NullGEOUNITValueObj = {}; //create object containing key(geoName):value(value) pairs' disciminates beween usuable values and unusable/null values
					var grades =  new Array();	
					var p = new Array();
					var q = new Array();
					var	cumulativeColWidth = 0;	
					var	rectTopLeftY = 0.0;		
					var colWidth = 0.0;
					var selectedBand = 0;	
					var rectNumber = 0;	
					var geoRank = -1;		
					var j=0; 									
					
					
					// boolean check to detemine which array of data divisions to access and use depending on what users have selected to define data limits.
					// Either standard set of divisions (contained by array 'divisions') if user has not checked ON the 'Fixed Data Ranges' checkbox, or
					// the specific set contained by array fixedDataRanges that is populated when user checks ON.
					if ( fixedValCheck == true ) { grades = fixedDataRanges; }
					else if ( customCheck == true ) { grades = customDivisions; }
					else { grades = divisions; }
					
				
					// remove name label of previously selected GEOUNIT
					d3.select("#geoName").remove();
					
					
					// define constaints of viewbox area
					var vbBufferTop = 10;
					var vbBufferBottom = 10;
					var vbBufferLeft = 30;
					var vbBufferRight = 30;	
					
					
					// local array to hold x coordinate of x-Axis ranking text label; accessed onmouseover
					var RankingX = new Array();	
					
					
					// define dimensions of viewbox
					var viewBoxWidth = canvasArea.width - vbBufferRight - vbBufferLeft;
					var viewBoxHeight = canvasArea.height - vbBufferTop - vbBufferBottom;
					
					
					// define dimensions of x and y-axis based on viewbox dimensions/constraints
					xAxis = { xStart : vbBufferLeft , xEnd : viewBoxWidth - vbBufferRight , yStart : 250 , yEnd : 250 };
					yAxis = { xStart : vbBufferLeft , xEnd : vbBufferLeft , yStart : 250 , yEnd : 65 };	
					
					
					// global variables set later to mouseovered bar height and bar top to use when user interacts with legend
					glblHghlghtBarHgt = yAxis.yStart - yAxis.yEnd;
					glblHghlghtBarTop = yAxis.yEnd;					
					
					
					// define extent and positions of viewbox within SVG area
					d3.select("#mainChart")
						.attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight);
				
				
					// determine and populate main data array built from data.js; make exact local copies of these to use later, and eecute their creation. 
					// sort tempArray,in decsending fashion (used to build visible components of ranking graph)
					var mainArray = arrayNames[selectedDatasetIndex];
					var subArray = mainArray + "[" + selectedYearIndex + "]";				
					var sliceArrayStr = "tempArray = " + subArray + ".slice()";	//array, later sorted descending ....
					var sliceArrayStr2 = "tempArray2 = " + subArray + ".slice()"; //copy of array, in original 'data.js' order ...						
					eval(sliceArrayStr);
					eval(sliceArrayStr2);									
					tempArray.sort(function(a,b){return b-a});				
					MaxValToUse = tempArray[0];
					
					
					// calculate sizes and dimensions specific to this instane of drawing the ranking graph,
					// based on predefined axis diemnsions, number of geography units (GEOUNITs), maximum data value
					var geoUnitColumnIntervalWidth = ( xAxis.xEnd-xAxis.xStart ) / (numElements);
					var	yScale = (yAxis.yStart - yAxis.yEnd) / MaxValToUse;	
					var	prevRectTopLeftX = xAxis.xStart;
					var	rectTopLeftX = xAxis.xStart;		
					
					
					// determine frequency of drawing tick marks on y-Axis based on the returned maximum value				
				
//					if ( MaxValToUse >= 0 ) { tickFrequency = 1; }
//					if ( MaxValToUse >= 10 ) { tickFrequency = 2; }
//					if ( MaxValToUse >= 25 ) { tickFrequency = 5; }
//					if ( MaxValToUse >= 50 ) { tickFrequency = 10; }									
					if ( MaxValToUse >= 0 ) { tickFrequency = 5; }
					if ( MaxValToUse >= 100 ) { tickFrequency = 50; }
					if ( MaxValToUse >= 200 ) { tickFrequency = 100; }
					if ( MaxValToUse >= 500 ) { tickFrequency = 200; }
					if ( MaxValToUse >= 1000 ) { tickFrequency = 1000; }
					if ( MaxValToUse >= 2000 ) { tickFrequency = 2000; }
					
					
					// draw y-Axis labels and tick marks ...
					for ( var i=0; i<=MaxValToUse; i++ )
					{			
						if ( (i)%tickFrequency==0 )
						{							
							
							// determine Y-axis scaling factor for placing axis tick marks/labels
							var yVal = (yAxis.yStart-(yScale*i));	
							
							var numZeros;
							
							var valnew = i;
							
							if ( selectedDatasetIndex == 5 ) { valnew = i/100; }
							
/*							
/*							var numZeros;
							
							var prefix = d3.formatPrefix(i);
							
							// http://en.wikipedia.org/wiki/Metric_prefix
							if(prefix.symbol=="")
							{
								numZeros = 0;
							}
							if(prefix.symbol==="k")
							{
								numZeros = 3;
							}
							if(prefix.symbol==="M")
							{
								numZeros = 6;
							}
							if(prefix.symbol==="G")
							{
								numZeros = 9;
							}
							if(prefix.symbol==="T")
							{
								numZeros = 12;
							}
							
//							
//							var valnew = addCommas(i);
							var valnew = i.toString();
							valnew = valnew.slice(0,valnew.length-numZeros);	*/															

//							var valnew = addCommas(i.toFixed(0));
																		
/*							d3.select("#mainChart")
								.append("div")
								.attr("class","yAxisTickLabelHolder")
								.attr("id","labelHolder_" + i)
								.attr("x", 50 )
								.attr("y", 50 )
								.attr("width",100)
								.attr("height",100)
								.attr("border-style", "solid")
								.attr("border-width","5px")
								.attr("border-color","red");			// ERROR*/
								
								
							var valnew = addCommas(i);
								
							var LabelX = xAxis.xStart-35;
								
							if ( valnew < 10 ) { LabelX = xAxis.xStart-20; }
							else if ( valnew < 100 ) { LabelX = xAxis.xStart-25; }
							else if ( valnew < 1000 ) { LabelX = xAxis.xStart-30; }
							
																			
							// Y-axis labels
							d3.select("#mainChart")
								.append("text")
								.attr("class","yAxisLabels")
								.text(valnew)
								.attr("x", LabelX )
								.attr("y", yVal+3 )						
								.attr("fill", "#909090")
								.attr("font-size", "9");					
								
								
							// Y-axis tick marks					
							d3.select("#mainChart")
								.append("line")
								.attr("class","yAxisTicks")
								.attr("x1", xAxis.xEnd+1)
								.attr("y1", yVal)
								.attr("x2", xAxis.xStart-5)
								.attr("y2", yVal)
								.attr("stroke", "#C8C8C8")
								.attr("stroke-width", "1");
						}
					}		
					
					
					// for each GEOUNIT feature ...					
					for ( var i=0; i<numElements; i++ )
					{
						
						
						// if GEOUNITs data value is NOT a true value (not null or undefined)
						if ( tempArray2[i] == undefined )
						{
							NullGEOUNITValueObj[GEOUNIT_Name[i]] = tempArray2[i]; // 'GEOUNIT_Name' is array of GEOUNIT names as ordered in data.js ..., NOT ranked descending ...
							tempGEOUNITListing[i] = GEOUNIT_Name[i];
						}
						
						
						// otherwise value is usable and GEOUNIT should be included and visible in ranking graph
						else
						{
							GEOUNITValueObj[GEOUNIT_Name[i]] = tempArray2[i]; // 'GEOUNIT_Name' is array of GEOUNIT names as ordered in data.js ..., NOT ranked descending ...
							tempGEOUNITListing[i] = GEOUNIT_Name[i];								
						}
						
						
						// re-initialise specific dimension variables to recalculate later
						rectTopLeftY = 0.0;
						colWidth = 0.0;
						colHeight = 0;


						// recalculate variables based on ranked GEOUNIT instance being considered as 'i'
						rectTopLeftX = vbBufferLeft+(i*geoUnitColumnIntervalWidth);	
						colWidth = geoUnitColumnIntervalWidth;
						
						
						// if data value for GEOUNIT is null/undefined, give vertical bar proxy height and top values,
						// and make clear so is not visible at right hand of ranking graph
						if ( tempArray[i] == null )
						{
							colHeight = (yAxis.yStart-yAxis.yEnd);			
							rectTopLeftY = (yAxis.yEnd);
							opcty = 0.0;
						}
						
						
						//other wise, give it opacity and specific height/top values
						else
						{
							colHeight = (tempArray[i]*yScale);			
							rectTopLeftY = (xAxis.yStart-(tempArray[i]*yScale));
							opcty = $('#opacitySlider').slider('value');
						}
							
							
							
						// determines which data band [from the legend] the GEOUNIT/value falls in.  Build new ID code string
						var band_ID = 0;
						var divisionValue = 0;					
						
						
						// for each data division value defined by user-selected settings
						for ( var k=0; k<grades.length; k++ )
						{		
						
							
							// define special case if division value is the lower bound to the lowest band (grades[0]). Reset to '-Inifinity'
							if ( k == 0 ) { divisionValue = -Infinity; }
							else { divisionValue = grades[k]; }
						
						
							// if value is actually found in a given data band
							if ( parseFloat(tempArray[i]) >= divisionValue )
							{								
								band_ID = k;
								band = "Band_" + k;
							}
							
							
							// otherwise value must be null/undefined
							// set band to proxy value of total number of divisions considered
							else if ( tempArray[i] == null )
							{
								band_ID = k;
								band = "Band_" + grades.length;
							}
							
							else
							{								
							}
						}	
						
						
						// populate array with x coordinate value to dynamically place ranking text under X-axis
						RankingX[i] = Math.ceil(rectTopLeftX);						
						
						
						// draw vertical coloured bar/rectangle for GEOUNIT. Coloured according to data band GEOUNIT falls in
						d3.select("#mainChart")
							.append("rect")
							.attr("value", tempArray[i] )
							.attr("x", Math.ceil(rectTopLeftX) )
							.attr("y", Math.ceil(rectTopLeftY) )
							.attr("width", Math.ceil(colWidth) )
							.attr("height", colHeight )
							.attr("stroke", getColor(tempArray[i], "drawTimeSeries") )
							.attr("fill", getColor(tempArray[i], "drawTimeSeries") )
							.attr("opacity", opcty )
							.attr("stroke-width", "0" )
							.attr("shape-rendering", "geometricPrecision" );	
							
						
						// draw vertical CLEAR bar on top of each GEOUNIT bar, that  user's interact with on mouseover with Ranking graph
						d3.select("#mainChart")
							.append("rect")
							.attr("id", rectNumber )
							.attr("class", band)
							.attr("x", Math.ceil(rectTopLeftX) )
							.attr("y", Math.ceil(yAxis.yEnd) )
							.attr("width", Math.ceil(colWidth) )
							.attr("height", (Math.ceil(yAxis.yStart) - Math.ceil(yAxis.yEnd))+10 )
							.attr("opacity", 0.0 )
							.attr("stroke-width", "0")
							.attr("shape-rendering", "geometricPrecision" )
							.on("mouseover", function() {


								// necessary to avoid display conflict with 'geoname'
								$( "#hoverPrompt" ).css( "display", "none" );		

								
								// Fix for users of IE when the select GEOUNIT on map, and mouseout over coast line. Resets all highlighted components on map, legend and graph areas
								// to allow interaction wih next element.
								if ( previousSelection == true && highlightedGEOUNIT == false )
								{
									
									geojson.resetStyle(previous);
									d3.select("#geoName").remove();
									d3.select("#rankingText1").remove();
									d3.select("#rankingText2").remove();
									d3.select("#valbg").remove();
									d3.select("#highlightedVertBar").remove();
									d3.select("#rankGeneratedLegendHighlightBox").remove();
		/*							d3.select("#rankGeneratedGraphHighlightBox").remove();*/
									d3.select("#rankGeneratedLegendHighlightBoxBorder").remove();
									$('.toRemove').remove();										
									
									highlightedGEOUNIT = false;
									hasHovered = false;
									needToRecalculateNumberInGrps = false;
									
									rankMouseOver = true;
									
									updateSimpleGraph();
								}
								
								
								// clear local arrays 
								p.length = 0;
								q.length = 0;
								
								
								// if user has NOT selected a specific GEOUNIT via mouse click, selection list or geosearch tool
								if ( highlightedGEOUNIT == false )
								{			
															
								
									// GEOUNITValueObj is ordered as in data.js ..., NOT ranked ascending or descending ...
									for ( var geoUnit in GEOUNITValueObj ) { p.push([geoUnit, GEOUNITValueObj[geoUnit]]); }	
								
									
									// NullGEOUNITValueObj is ordered as in data.js ..., NOT ranked ascending or descending ...
									for ( var geoUnit in NullGEOUNITValueObj ) { q.push([geoUnit, NullGEOUNITValueObj[geoUnit]]); }										
									
									
									// populate and sort each local array into required order (one ascending, one descending)
									p.sort(function(a, b) {return b[1] - a[1]}); // ranked/ordered	
									q.sort(function(a, b) {return a[0] - b[0]}); // ranked/ordered ascending alphabetically ...																					
									p = p.concat(q);
									
									
									// determine selected GEOUNIT feature, and its correct CD and NM									
									var featureIndex = tempGEOUNITListing.indexOf(p[this.id][0].toString());										
									currentHoverOverGEOUNIT_CD = ukData.features[featureIndex].properties.GEOUNIT_CD;										
									currentHoverOverGEOUNIT_NM = p[this.id][0].toString();
																	
									
									// determine the selected feature's data value and geometry information from 'data.js'
									var featureIndexVal = ukData.features[featureIndex].properties.datavalues[selectedDatasetIndex][selectedYearIndex];
									geomType = ukData.features[featureIndex].geometry;
									
									
									// calculate x coordinate for x-axis ranking text
									rankingX = Math.ceil(rectTopLeftX);
									
									
									// call routine to highlight selected GEOUNIT on map. allows fast interaction by user with map layer
									fixHighlightPoly();																
									
									
									// highlight vertical clear bar with complamentary colour extracted from 'colorbrewer.js'
									d3.select(this)
										.attr("opacity", 1.0)
										.attr("stroke", compColour )
										.attr("fill", compColour )
										.attr("stroke-width", "0" )
										.attr("shape-rendering", "geometricPrecision" );
					
									var f_size;
									var top_pos;
									var left_pos;
														 
									if ( currentHoverOverGEOUNIT_NM.length >= 0 )
									{	
										f_size = "17px";
										left_pos = "15px";
									}
									if ( currentHoverOverGEOUNIT_NM.length >= 37 )
									{
										f_size = "11px";
										top_pos = "19px";
										left_pos = "15px";
									}
									
									d3.select("#graphSVGDiv")
										.append("text")
										.attr("id","geoName")
										.text(currentHoverOverGEOUNIT_NM)
										.attr("fill", "#0581c9")	
										.attr("top", top_pos)
										.attr("left", left_pos)	
										.style("font-size", f_size)
										.attr("z-index", "+13");	
										
								 	var Ex;
								 	var BgEx;
					
									if ( featureIndexVal == null )
									{	
										// redraw background to name label
										d3.select("#mainChart")
											.append("rect")
											.attr("id", "valbg" )
											.attr("x", 197 )
											.attr("y", 55 )
											.attr("width", 80 )
											.attr("height", 30 )
											.attr("stroke", "white" )
											.attr("fill", "white" )
											.attr("opacity", 1.0 )
											.attr("stroke-width", "0" );								
											
										//	draw data value of selected GEOUNIT
										d3.select("#mainChart")
											.append("text")
											.attr("id","")
											.text("No data")	
											.attr("x", xAxis.xEnd-69 )
											.attr("y", yAxis.yEnd+10 )
											.attr("fill", "#0581c9")
											.attr("font-size", "15");
									}
									else 
									{
										GEOUNITtext = featureIndexVal.toFixed(1) + variableUnitGraphRankSelectedValue[selectedDatasetIndex];
										
										if ( selectedDatasetIndex == 5 ) {
											Ex = xAxis.xEnd-215;
											BgEx = xAxis.xEnd-225;
											BgW = 425;
										}
										else {
											Ex = xAxis.xEnd-40;
											BgEx = xAxis.xEnd-50;
											BgW = 120;
										}										
										
										// redraw background to name label
										d3.select("#mainChart")
											.append("rect")
											.attr("id", "valbg" )
											.attr("x", /*131*/BgEx )
											.attr("y", 55 )
											.attr("width", /*160*/BgW )
											.attr("height", 30 )
											.attr("stroke", "white" )
											.attr("fill", "white" )
											.attr("opacity", 1.0 )
											.attr("stroke-width", "0" );
											
										//	draw data value of selected GEOUNIT
										d3.select("#mainChart")
											.append("text")
											.attr("id","rankingText1")
											.text(GEOUNITtext)	
											.attr("x", /*xAxis.xEnd-136*/Ex )
											.attr("y", yAxis.yEnd+10 )
											.attr("fill", "#0581c9")
											.attr("font-size", "14");	
									}									
																				
																				
									//	draw ranking text label below x-axis using rankingX[] array populated earlier
									d3.select("#mainChart")
										.append("text")
										.attr("id","rankingText2")
										.text((Number(this.id)+1 + "/" + numElements)) // uses numElements
										.attr("x", RankingX[this.id]-15 )
										.attr("y", yAxis.yStart+25 )
										.attr("fill", "#0581c9")
										.attr("font-size", "10");
										
										
									// determine required fill colour (reqFill) based on selected feature's data valueand teh data band it falls inside
									 // ColorBrewer colour arrays are ordered light [array element 0] to dark [array element 'Length-1']				
									var reqFill;					 
									if ( featureIndexVal != null )
									{	
									
									
										// initialise and set values for local variables to determine positioning of decimal place in number strings
										var valueDecimalPlace = (featureIndexVal.toString()).indexOf('.');
										var ValLength = (featureIndexVal.toString()).length;
										var interimVal;
										
										 
										// for each data band division value
										for ( var k=0; k<grades.length; k++ )							
										{	
										
										
											// determine index positions within number string that decimal place falls.
											// compare this to equivalent positons in data band divison value to
											var checkDecimalPlace = (grades[k].toString()).indexOf('.');
											var checkLength = (grades[k].toString()).length;
																						
																						
											// evaluate if data value falls inside/outside data band
											if ( (ValLength-valueDecimalPlace) > (checkLength-checkDecimalPlace) )
											{	
												var toFixedLen = checkLength-checkDecimalPlace-2;											
												interimVal = featureIndexVal.toFixed(toFixedLen);
											}
											else
											{
												interimVal = featureIndexVal;
											}
										
										
											// check if value is actually unusable (null/undefined)											
											if ( interimVal != null )
											{	
												var val;
												
												if ( k == 0 ) { val = -Infinity; } 
												else  { val = grades[k]; } 
												
												
												if ( parseFloat( featureIndexVal ) >= parseFloat(val) )  
												{
													band = k;
													reqFill = getColor((grades[band]), "drawTimeSeries");
												}
											}
											
											
											// otherwise data value is null/undefined and defaults to grey/highest band number
											else
											{
												band = grades.length;
												reqFill = '#CCC';
											}
										}
									}
									
									
									// otherwise data value is null/undefined and defaults to grey/highest band number
									else
									{
										band = grades.length;
										reqFill = '#CCC';
									}
									
									
									// draw proxy highlight box correctly positioned to overlay true legend box									
									d3.select("#simpleChart")
										.append("rect")
										.attr("id", "rankGeneratedLegendHighlightBox" )
										.attr("position", "absolute" )
										.attr("x", -4 )
										.attr("y", 28+(18*band) )
										.attr("width", 14 )
										.attr("height", 14 )
										.attr("padding", 0 )
										.attr("opacity", $('opacitySlider').slider("value") ) 							
										.attr("stroke-style", "solid" )					
										.attr("stroke-width", 0 )
										.attr("stroke", reqFill )
										.attr("fill", reqFill );
									
									
									// draw proxy highlight box correctly positioned to overlay true legend box									
									d3.select("#simpleChart")
										.append("rect")
										.attr("id", "rankGeneratedLegendHighlightBoxBorder" )
										.attr("position", "absolute" )
										.attr("x", -4 )
										.attr("y", 28+(18*band) )
										.attr("width", 14 )
										.attr("height", 14 )
										.attr("padding", 0 )
										.attr("opacity", $('opacitySlider').slider("value") ) 							
										.attr("stroke-style", "solid" )					
										.attr("stroke-width", 2 )
										.attr("stroke", compColour )
										.attr("fill", "none" ); 
									
									
									// draw proxy vertical highlight bar correctly positioned inside legend
									// vertical highlight bar to simple count graph											
									d3.select("#simpleChart")
										.append("rect")
										.attr("id", "rankGeneratedGraphHighlightBox" )
										.attr("position", "absolute" )
										.attr("x", 83 )
										.attr("y", 27+(18*band) )
										.attr("width", 5 )
										.attr("height", 16 )
										.attr("padding", 0 )
										.attr("opacity", $('opacitySlider').slider("value")  ) 							
										.attr("stroke-style", "solid" )					
										.attr("stroke-width", 0 )
										.attr("stroke", compColour )
										.attr("fill", compColour); 
								}
							})
							.on("mouseout", function() {


								// necessary to avoid display conflict with 'geoname'
								if ( graphType != "Rank" ) {
									$( "#hoverPrompt" ).css( "display", "inline" );		
								}

								
								rankMouseOver = false;
								previousSelection = false;
								
								
								// after user exits interaction with ranking graph, reset highlight/opacity to null of overlain vertical bar
								// remove relevant text labels
								// remove highlighting polygon on map
								if ( highlightedGEOUNIT == false )
								{																		
									d3.select(this)
										.attr("opacity", 0.0);																		  
									d3.select("#geoName").remove();	  
									d3.select("#valbg").remove();
									d3.select("#rankingText1").remove();
									d3.select("#rankingText2").remove();
									d3.select("#rankGeneratedLegendHighlightBox").remove();
									d3.select("#rankGeneratedGraphHighlightBox").remove();
									d3.select("#rankGeneratedLegendHighlightBoxBorder").remove();									
									map.removeLayer(unitPolygon);
								}
							});	
							
							
							// increment j in certain circumstances													
							 if ( tempArray[i] == tempArray[i-1] ) {} 
							else if ( tempArray[i] != tempArray[i-1] ) { j++; }
												
							rectNumber++; 
					}
					
					
					// redraw maximum value on top of y-axis							
					d3.select("#mainChart")
						.append("text")
						.attr("id","maxVal")
						.text(/*MaxValToUse.toFixed(1) + */variableUnitGraphRankSelectedValue[selectedDatasetIndex])
						.attr("x", yAxis.xEnd-32 )
						.attr("y", yAxis.yEnd-10 )
						.attr("fill", "#909090")
						.attr("font-size", "10");
					
					
					// redraw number of considered units on end of x-Axis						
					d3.select("#mainChart")
						.append("text")
						.attr("id","GEOUNITCount")
						.text(numElements) 
						.attr("x", xAxis.xEnd+5 )
						.attr("y", yAxis.yStart )
						.attr("fill", "#909090")
						.attr("font-size", "10");
					
								
					// redraw X-Axis to rank graph ...
					d3.select("#mainChart")	
						.append("line")
						.attr("id","xAxis")
						.attr("x1", xAxis.xStart)
						.attr("y1", xAxis.yStart)
						.attr("x2", xAxis.xEnd+1)
						.attr("y2", xAxis.yEnd)
						.attr("stroke", "#909090")
						.attr("stroke-width", "1");	
						
						
					// redraw Y-Axis to rank graph ...						
					d3.select("#mainChart")
						.append("line")
						.attr("id","yAxis")
						.attr("x1", yAxis.xStart)
						.attr("y1", yAxis.yStart)
						.attr("x2", yAxis.xEnd)
						.attr("y2", yAxis.yEnd)
						.attr("stroke", "#909090")
						.attr("stroke-width", "1");
										
					// redraw horizontal trendline for dataset/data year selected by user
					if ( trendLine[selectedDatasetIndex][selectedYearIndex] != null )
					{							
						d3.select("#mainChart")
							.append("line")
							.attr("id","trendLine")
							.attr("x1", xAxis.xStart) 
							.attr("y1", yAxis.yStart-(trendLine[selectedDatasetIndex][selectedYearIndex]*yScale) ) 
							.attr("x2", xAxis.xEnd)
							.attr("y2", yAxis.yStart-(trendLine[selectedDatasetIndex][selectedYearIndex]*yScale) )
							.attr("stroke",compColour)
							.attr("stroke-width", "1");
						
						
						// write geocoverage abbrevation taken from config.js file								
						d3.select("#mainChart")
							.append("text")
							.attr("id", "geoCoverageLabel")
							.text(geoCoverageAbbrev)
							.attr("x", (xAxis.xEnd)+5 )
							.attr("y", yAxis.yStart-(trendLine[selectedDatasetIndex][selectedYearIndex]*yScale)+3 )
							.attr("fill", "#909090")
							.style("font-size", "10");
						
						
						// write additional sufix text to geocoverage abbrevation taken from config.js file							
						d3.select("#mainChart")
							.append("text")
							.attr("id", "addText")
							.text(addText)
							.attr("x", (xAxis.xEnd)+18 )
							.attr("y", yAxis.yStart-(trendLine[selectedDatasetIndex][selectedYearIndex]*yScale)+3 )
							.attr("fill", "#909090")
							.attr("font-size", "10px");
					}
					else
					{
						
						// write "No data  available" string							
						d3.select("#mainChart")
							.append("text")
							.attr("id", "NoDataStr")
							.text("No data  available")
							.attr("x", 90 )
							.attr("y", 150 )
							.attr("fill", "#909090")
							.style("font-size", "18px");	
						
					}
						
				}// END DEFAULT GRAPH DRAWING; RANKING GRAPH, INCLUDING  INVISIBLE COLUMNS TO AID INTERACTION
				
				
				// entered if user interacts with map and time-seies is selected in 'graph-drop' (and a time-series graph is required).							
				if( ( hasHovered == true || highlightedGEOUNIT == true ) && graphType=="Time-series" && subDataArrayLength > 1 )
				{ 
					
	
					$( "#hoverPrompt" ).css( "display", "none" );			
				
									
					// innitialize specific buffer sizes for mgraphing area	
					// define constaints of viewbox area
					var vbBufferTop = 10;
					var vbBufferBottom = 10;
					var vbBufferLeft = 30;
					var vbBufferRight = 30;						
					
					
					// iniitalise local arrays for holding line vertex coordinates
					var lineXCoords = [];
					var lineYCoords = [];
					var AvelineXCoords= [];
					
					var f_size;
					var top_pos;
					var left_pos;
										 
					if ( currentHoverOverGEOUNIT_NM.length >= 0 )
					{	
						f_size = "17px";
						left_pos = "15px";
					}
					if ( currentHoverOverGEOUNIT_NM.length >= 37 )
					{
						f_size = "11px";
						top_pos = "19px";
						left_pos = "15px";
					}
					
					d3.select("#graphSVGDiv")
						.append("text")
						.attr("id","geoName")
						.text(currentHoverOverGEOUNIT_NM)
						.attr("fill", "#0581c9")	
						.attr("top", top_pos)
						.attr("left", left_pos)	
						.style("font-size", f_size)
						.attr("z-index", "+13");
					
					
					// determine viewbox dimensions based on canvas and buffer sizes					
					var viewBoxWidth = canvasArea.width - vbBufferRight - vbBufferLeft;
					var viewBoxHeight = canvasArea.height - vbBufferTop - vbBufferBottom;
					
					
					// define y- and x-axis dimensions
					xAxis = { xStart : vbBufferLeft , xEnd : viewBoxWidth - vbBufferRight , yStart : 250 , yEnd : 250 };
					yAxis = { xStart : vbBufferLeft , xEnd : vbBufferLeft , yStart : 250 , yEnd : 65 };	
					
					
					// declare main chart area viewbox specification
					d3.select("#mainChart")
						.attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight);
					var AvelineYCoords= [];
				
				
					//	construct and execute string to generate required main array of data values; make copy
					var mainArray = arrayNames[selectedDatasetIndex];
					var storeAsTempArray = "tempArray = " + mainArray;
					eval(storeAsTempArray);
				
				
					// start building string to generate max value array to determine max Val of data considered to draw y-axis
					var maxArray = arrayMaxNames[selectedDatasetIndex];
					var storeArrayMaxAsMaxVal = "MaxVal = " + maxArray + "[";
					
					
					// determine frequency of tick marking on graphs based on number of geography units lsited in 'data.js'
					if ( (endYear-startYear) >= 0 ) { tickFrequency = 1; }
					if ( (endYear-startYear) >= 10 ) { tickFrequency = 2; }
					if ( (endYear-startYear) >= 20 ) { tickFrequency = 5; }
					if ( (endYear-startYear) >= 50 ) { tickFrequency = 10; }				
				
				
					// for each year
					for (var i=0; i<subDataArrayLength; i++) 
					{														
					
						// construct interative string to build max array, and execute
						storeArrayMaxAsMaxVal = storeArrayMaxAsMaxVal + i + "]";						
						eval(storeArrayMaxAsMaxVal);					
						
						
						// logical checek to check and update maxmimum data value if required.
						// calculate y axis scaling accoridng to 'MaxVal'
						if( MaxVal > MaxValToUse) { MaxValToUse = MaxVal; }						
//						yScale = (yAxis.yStart - yAxis.yEnd) / Math.ceil(MaxValToUse);	
						
						
						// calculate time parameters required
						var yearIntervalWidth = ( xAxis.xEnd-xAxis.xStart ) / (subDataArrayLength-1);
						var year = startYear + (i*yearInterval);
						
							
						if ( (i)%tickFrequency==0 )
						{															
							// add x-axis 'year' label
							d3.select("#mainChart")
								.append("text")
								.attr("class","xAxisLabels")
								.text(year)
								.attr("x", (margin.left+(yearIntervalWidth*i))+5 )
								.attr("y", yAxis.yStart+25 )
								.attr("font-size", "10px")
								.attr("fill", "#909090");

							//draw x-Axis tick marks
							d3.select("#mainChart")
								.append("line")
								.attr("class","tickMarks")
								.attr("x1", (margin.left+(yearIntervalWidth*i))+15 )
								.attr("y1", yAxis.yStart)
								.attr("x2", (margin.left+(yearIntervalWidth*i))+15 )
								.attr("y2", yAxis.yStart+5)
								.attr("stroke", "#CCC")
								.attr("stroke-width", "3")
								.style("stroke-dasharray", ("5, 2"));
						}	
							
						
						// executed if year selected on time-slider equals current iteration year
						if( i == selectedYearIndex )
						{										
						
						
							//draw vertical highlight-year line
							d3.select("#mainChart")
							.append("line")
								.attr("id","highlightLine")
								.attr("x1", xAxis.xStart+(yearIntervalWidth*i))
								.attr("y1", yAxis.yEnd-1)
								.attr("x2", xAxis.xStart+(yearIntervalWidth*i))
								.attr("y2", yAxis.yStart+10)
								.attr("stroke", "#CCC")
								.attr("stroke-width", "3")
								.style("stroke-dasharray", ("5, 2"));
						}
						
							
//						// fix for DVC163 - does not calculate coordinates for final value (as is null)
//						if ( tempArray[i][indexOfCurrentHoverOverGEOUNIT_CD] == null )
//						{
//							lineXCoords[i] = lineXCoords[i-1];
//							lineYCoords[i] = lineYCoords[i-1];
//							continue;
//						} 
						  
						//store coordinates for time-series line to plot in 'for' loop below 
//						lineXCoords[i] = xAxis.xStart+(yearIntervalWidth*i);
//						lineYCoords[i] = (xAxis.yStart-(tempArray[i][indexOfCurrentHoverOverGEOUNIT_CD]*yScale));
								
						storeArrayMaxAsMaxVal = "MaxVal = " + maxArray + "[";			
					}
										


					// to fix bug found with scaling of multiple years across a dataset. Moved from outside the previous for lop
					yScale = (yAxis.yStart - yAxis.yEnd) / Math.ceil(MaxValToUse);
					

					for (var i=0; i<subDataArrayLength; i++) 
					{  
						//store coordinates for time-series line to plot in 'for' loop below 
						lineXCoords[i] = xAxis.xStart+(yearIntervalWidth*i);
						lineYCoords[i] = (xAxis.yStart-(tempArray[i][indexOfCurrentHoverOverGEOUNIT_CD]*yScale));
					}
					
						
					
					
						
					//store coordinates for 'mean' trend line if values exist to plot in 'for' loop below
					if ( trendLine.length != 0 )
					{
						for(var t=0; t<trendLine[selectedDatasetIndex].length; t++ ) 
						{	
							if ( trendLine[selectedDatasetIndex][t] == null )
							{
								AvelineXCoords[t] = AvelineXCoords[t-1];
								AvelineYCoords[t] = AvelineYCoords[t-1];
								continue;
							} 
											
							var trendLineValue = trendLine[selectedDatasetIndex][t];
							AvelineXCoords[t] = xAxis.xStart+(yearIntervalWidth*t);
							AvelineYCoords[t] = (xAxis.yStart-(trendLineValue*yScale));
						}
					}
					
							
					//	each element/year in data sub-array, except the final one
					for(i=0; i<subDataArrayLength-1; i++)
					{
						
					
						// fudge for DVC163 - avoids printing time-series for NI areas with null values for whole time-series
						if (  currentHoverOverGEOUNIT_CD == 'UKN01' || currentHoverOverGEOUNIT_CD == 'UKN02' || currentHoverOverGEOUNIT_CD == 'UKN03' || currentHoverOverGEOUNIT_CD == 'UKN04' || currentHoverOverGEOUNIT_CD == 'UKN05' ) {		
						
							// don't draw any lines, but instead text strings stating area has null/undefined values
							d3.select("#mainChart")
								.append("text")
								.attr("id","noDataAvailableLabel")
								.text("No data available")
								.attr("x", xAxis.xStart+((xAxis.xEnd-xAxis.xStart)/5) )
								.attr("y", yAxis.yEnd+((yAxis.yStart-yAxis.yEnd)/2)  )
								.attr("fill", "#A8A8A8")
								.attr("font-size", "20px");
								
							continue;
						}
														
					
						
						// if user has selected a GEOUNIT by clicking mouse, using seelction list or using geosearch tool,
						// and data exists to plot trend/value lines
						if( ( hasHovered == true || highlightedGEOUNIT == true ) && checkTest == false )
						{	
						

							// plot component of GEOUNIT time-series line, between current point and next point
							d3.select("#mainChart").append("line")
								.attr("id", "timeSeriesLine")
								.attr("x1", lineXCoords[i] )
								.attr("y1", lineYCoords[i] )
								.attr("x2", lineXCoords[i+1] )
								.attr("y2", lineYCoords[i+1] )
								.attr("stroke", compColour)
								.attr("fill", compColour)
								.attr("stroke-width", "2");
						

							// plot component of mean line, between current point and next point							
							d3.select("#mainChart").append("line")
								.attr("id", "trendLine")
								.attr("x1", AvelineXCoords[i] )
								.attr("y1", AvelineYCoords[i] )
								.attr("x2", AvelineXCoords[i+1] )
								.attr("y2", AvelineYCoords[i+1] )
								.attr("stroke", "black")
								.attr("fill", "black")
								.attr("stroke-width", "2");
						}
						
						
						// area has null/undefined values
						else
						{		
						
							// don't draw any lines, but instead text strings stating area has null/undefined values
							d3.select("#mainChart")
								.append("text")
								.attr("id","noDataAvailableLabel")
								.text("No data available")
								.attr("x", xAxis.xStart+((xAxis.xEnd-xAxis.xStart)/5) )
								.attr("y", yAxis.yEnd+((yAxis.yStart-yAxis.yEnd)/2)  )
								.attr("fill", "#A8A8A8")
								.attr("font-size", "20px");
						}	
					}
					
										
					// if data exists for selected GEOUNIT					
					if( ( hasHovered == true || highlightedGEOUNIT == true ) && checkTest == false ) 
					{				
					
							// draw geographic extent abbreviation at right hand end of trend line - flexible for lines not ending at final year value
							d3.select("#mainChart")
								.append("text")
								.attr("id", "geoCoverageLabel")
								.text(geoCoverageAbbrev)
								.attr("x", (lineXCoords[lineXCoords.length-1])+5 )
								.attr("y", AvelineYCoords[AvelineYCoords.length-1]+3 )
								.attr("fill", "#909090")
								.style("font-size", "10");	
					
					
							// write additional sufix text to geocoverage abbrevation taken from config.js file							
							d3.select("#mainChart")
								.append("text")
								.attr("id", "addText")
								.text(addText)
								.attr("x", (lineXCoords[lineXCoords.length-1])+18 )
								.attr("y", AvelineYCoords[AvelineYCoords.length-1]+3 )
								.attr("fill", "#909090")
								.attr("font-size", "10px");								
					
					
							// redraw maximum value on top of y-axis							
							d3.select("#mainChart")
								.append("text")
								.attr("id","maxVal")
								.text(/*MaxValToUse.toFixed(1) + */variableUnitGraphYAxis[selectedDatasetIndex])
								.attr("x", yAxis.xEnd-32 )
								.attr("y", yAxis.yEnd-10 )
								.attr("fill", "#909090")
								.attr("font-size", "10");																	
					}
					
					
					// determine tick frequency for y-axis based on max value detemiend from all data					
					if ( MaxValToUse >= 0 ) { tickFrequency = 1; }
					if ( MaxValToUse >= 10 ) { tickFrequency = 2; }
					if ( MaxValToUse >= 25 ) { tickFrequency = 5; }
					if ( MaxValToUse >= 50 ) { tickFrequency = 10; }					
					
					
					// draw y-axis labels and tick marks
					for ( var i=0; i<=MaxValToUse; i++ )
					{			
						if ( (i)%tickFrequency==0 )
						{
							
							// calculate y-coordinate to draw axis label and tick mark at
							// draw y-axis labels				
							var yVal = (yAxis.yStart-(yScale*i));												
							d3.select("#mainChart")
								.append("text")
								.attr("class","yAxisLabels")
								.text(i.toFixed(1))
								.attr("x", xAxis.xStart-33 )
								.attr("y", yVal+3 )
								.attr("fill", "#909090")
								.attr("font-size", "9px");					
					
					
							// draw y-axis ticks
							d3.select("#mainChart").append("line")
								.attr("class","yAxisTicks")
								.attr("x1", xAxis.xStart)
								.attr("y1", yVal)
								.attr("x2", xAxis.xStart-5)
								.attr("y2", yVal)
								.attr("stroke", "#707070")
								.attr("stroke-width", "1");
						}
					}
						
						
					// draw X-axis
					d3.select("#mainChart")	
						.append("line")
						.attr("id","xAxis")
						.attr("x1", xAxis.xStart)
						.attr("y1", xAxis.yStart)
						.attr("x2", xAxis.xEnd+1)
						.attr("y2", xAxis.yEnd)
						.attr("stroke", "#909090")
						.attr("stroke-width", "2");	
						
						
					// draw Y-axis
					d3.select("#mainChart")
						.append("line")
						.attr("id","yAxis")
						.attr("x1", yAxis.xStart)
						.attr("y1", yAxis.yStart)
						.attr("x2", yAxis.xEnd)
						.attr("y2", yAxis.yEnd)
						.attr("stroke", "#909090")
						.attr("stroke-width", "2");									
						
						
				} // END DRAW TIME-SERIES GRAPH ...
				
				
				// draws vertical GEOUNIT Highlight bar when user hover overs map, and 'Rank" is selected in 'graph-drop'
				else if( ( hasHovered == true || highlightedGEOUNIT == true ) && graphType=="Rank" )		
				{
					
					d3.select("#geoName").remove();
					
					var f_size;
					var top_pos;
					var left_pos;
										 
					if ( currentHoverOverGEOUNIT_NM.length >= 0 )
					{	
						f_size = "17px";
						left_pos = "15px";
					}
					if ( currentHoverOverGEOUNIT_NM.length >= 37 )
					{
						f_size = "11px";
						top_pos = "19px";
						left_pos = "15px";
					}
					
					d3.select("#graphSVGDiv")
						.append("text")
						.attr("id","geoName")
						.text(currentHoverOverGEOUNIT_NM)
						.attr("fill", "#0581c9")	
						.attr("top", top_pos)
						.attr("left", left_pos)	
						.style("font-size", f_size)
						.attr("z-index", "+13");	
																		
					
					// if true usable dta exists for selected GEOUNIT
					if ( checkTest == false )
					{
						
						
						// initialise local variables
						var HighlightRectDimensions = new Array();
						var p = []; 	
						var	cumulativeColWidth = 0;	
						var	rectTopLeftY = 0.0;
						var rectNumber = -1;			
						var colWidth = 0.0;	
						var geoRank = -1;		
						var j=0;
						var GEOUNITValueObjRank = {}; //create object containing key(geoName):value(value) pairs' disciminates beween usuable values and unusable/null values							
					
											
											
						// for each geography unit listed in 'data.js'					
						for ( var i=0; i<numElements; i++ )
						{
							
							// initialise local variables
							rectTopLeftY = 0.0;
							colWidth = 0.0;
							colHeight = 0;
							
							
							// copy current feature's data  values into object
							GEOUNITValueObjRank[GEOUNIT_Name[i]] = tempArray2[i];
							
							
							// if feature object does not have any data values associated with it , loop to next interation
							if ( tempArray[i] == undefined ) { continue; }
							
							
							// otherwise, check to see it array specifc to hold parameters for highlighting specific transparent vertical bar in ranking graph
							if ( typeof HighlightRectDimensions === 'undefined' ) { HighlightRectDimensions = new Array(7); }
  
  
  
							// recalculate dimensions specific to instance of vertical bar 
							rectTopLeftX = vbBufferLeft+(i*geoUnitColumnIntervalWidth);			
							rectTopLeftY = (xAxis.yStart-(tempArray[i]*yScale));
							colWidth = geoUnitColumnIntervalWidth;
							colHeight = (tempArray[i]*yScale);
							
							
							// if data value of current iteration equals that of selected GEOUNIT, this must be the GEOUNIT to highlight in map/ranking graph							
							if ( tempArray[i] == selectedGEOUNITVariables[selectedDatasetIndex] )
							{	
							
							
								// define specific parameters specific to highlighting vertical bar
								HighlightRectDimensions[0] = rectNumber; // specific ID for highlight bar
								HighlightRectDimensions[1] = tempArray[i]; // GEOUNIT value
								HighlightRectDimensions[2] = Math.ceil(rectTopLeftX); // rect top left x coordinate value
								HighlightRectDimensions[3] = Math.ceil(yAxis.yEnd);	// rect top left y coordinate value			 
								HighlightRectDimensions[4] = Math.ceil(colWidth); // rect width
								HighlightRectDimensions[5] = Math.ceil(yAxis.yStart) - Math.ceil(yAxis.yEnd)+10;	
								HighlightRectDimensions[6] = compColour; // complamentary colour
							}
							
							rectNumber++; 							
						}
						
						
						// draw specific vertical highlight bar over coloured representation of GEOUNIT selected 
						d3.select("#mainChart")
						  .append("rect")
						  .attr("id", "highlightedVertBar" /*HighlightRectDimensions[0]*/ )
						  .attr("x", HighlightRectDimensions[2] )
						  .attr("y", HighlightRectDimensions[3] )
						  .attr("width", HighlightRectDimensions[4] )
						  .attr("height", HighlightRectDimensions[5] )
						  .attr("stroke", HighlightRectDimensions[6] )
						  .attr("fill", HighlightRectDimensions[6] )
						  .attr("opacity", 1.0 )
						  .attr("stroke-width", "0" )
						  .attr("shape-rendering", "geometricPrecision" );
						  	
							
						// push object key:value pairs into temporary array to determine ranking of selected GEOUNIT from all GEOUNITs ranking in descending fashion
						for ( var geoUnit in GEOUNITValueObjRank ) { p.push([geoUnit, GEOUNITValueObjRank[geoUnit]]); }
						p.sort(function(a, b) {return b[1] - a[1]});
						
						var selectedRank = -1;
						
						
						// for each element in array
						for (var key in p)
						{							
						
							
							// if key is tru object value
							if (p.hasOwnProperty(key))
							{								
	
							
								// p[key][0] = selected GEOUNIT_NA
								if(	currentHoverOverGEOUNIT_NM == p[key][0].toString() ) { selectedRank = parseInt(key)+1; }
							}
						}
							
										
					 	var Ex;
					 	var BgEx;	
						
						if ( (selectedGEOUNITVariables[selectedDatasetIndex]) != null )
						{
													
							if ( selectedDatasetIndex == 5 ) {
								Ex = xAxis.xEnd-215;
								BgEx = xAxis.xEnd-225;
								BgW = 425;
							}
							else {
								Ex = xAxis.xEnd-40;
								BgEx = xAxis.xEnd-50;
								BgW = 120;
							}										
							
							// redraw background to name label
							d3.select("#mainChart")
								.append("rect")
								.attr("id", "valbg" )
								.attr("x", /*131*/BgEx )
								.attr("y", 55 )
								.attr("width", /*160*/BgW )
								.attr("height", 30 )
								.attr("stroke", "white" )
								.attr("fill", "white" )
								.attr("opacity", 1.0 )
								.attr("stroke-width", "0" );
								
							//	draw data value of selected GEOUNIT
							d3.select("#mainChart")
								.append("text")
								.attr("id","rankingText1")
								.text((selectedGEOUNITVariables[selectedDatasetIndex]).toFixed(1) + variableUnitGraphRankSelectedValue[selectedDatasetIndex])	
								.attr("x", /*xAxis.xEnd-136*/Ex )
								.attr("y", yAxis.yEnd+10 )
								.attr("fill", "#0581c9")
								.attr("font-size", "14");																									
					
						}
						else 
						{	
							// redraw background to name label
							d3.select("#mainChart")
								.append("rect")
								.attr("id", "valbg" )
					  			.attr("x", 197 )
						  		.attr("y", 45 )
						  		.attr("width", 80 )
								.attr("height", 30 )
								.attr("stroke", "white" )
								.attr("fill", "white" )
								.attr("opacity", 1.0 )
								.attr("stroke-width", "0" );								
								
							//	draw data value of selected GEOUNIT
							d3.select("#mainChart")
								.append("text")
								.attr("id","rankingText1")
								.text("No data")	
								.attr("x", xAxis.xEnd-69 )
								.attr("y", yAxis.yEnd )
								.attr("fill", "#0581c9")
								.attr("font-size", "15");	
							}
						
						
						//	draw ranking value string below x-axis. Positioned under newly drawn highlight bar
						d3.select("#mainChart")
							.append("text")
							.attr("id","rankingText2")
							.text(selectedRank + "/" + numElements)
							.attr("x", HighlightRectDimensions[2]-15)
							.attr("y", yAxis.yStart+25 )
							.attr("fill", "#0581c9")
							.attr("font-size", "10");						
					}
	

					//	reinitialise 'selectedRank'
					selectedRank = 0;
					GEOUNITValueObjRank = [];		
					p = [];
					q = [];						
					
					
				} // END DRAWING OF INTERACTIVE COMPONENTS TO RANKING GRAPH
					
					
				//	if user interacts with map layer and 'Details' is selected in 'graph-drop'
				else if( ( hasHovered == true || highlightedGEOUNIT == true ) && graphType=="Details" && drop.length > 1  )	
				{
					$( "#hoverPrompt" ).css( "display", "none" );			
				
									
					// define axis limits
					xAxis = { xStart : 100 , xEnd : 310 , yStart : 275 , yEnd : 275 };
					yAxis = { xStart : 100 , xEnd : 100, yStart : 275 , yEnd : 50 };
				
									
					// draw geography unit label at head of graph				
					var f_size;
					var top_pos;
					var left_pos;
										 
					if ( currentHoverOverGEOUNIT_NM.length >= 0 )
					{	
						f_size = "17px";
						left_pos = "15px";
					}
					if ( currentHoverOverGEOUNIT_NM.length >= 37 )
					{
						f_size = "11px";
						top_pos = "19px";
						left_pos = "15px";
					}
					
					d3.select("#graphSVGDiv")
						.append("text")
						.attr("id","geoName")
						.text(currentHoverOverGEOUNIT_NM)
						.attr("fill", "#0581c9")	
						.attr("top", top_pos)
						.attr("left", left_pos)	
						.style("font-size", f_size)
						.attr("z-index", "+13");
	
	
					// make copy of main data array to consider				
					var tempArray = selectedGEOUNITVariables.slice();				
				
											
					// for each dataset defined in 'data.js', determine maximum value across all datasets. Use this to build static x-axis
					for (var i=0; i<NumberOfDataSets; i++ )
					{
						if ( skippedVariables[i] == 1 ) { continue; }
						
						var maxArray = arrayMaxNames[i];
						var sliceArrayStr = "maxVal = " + maxArray + ".slice(" +  selectedYearIndex +  "," + (selectedYearIndex+1) + ")";
						eval(sliceArrayStr);

						if ( parseFloat(maxVal) > parseFloat(MaxValToUse) ) { MaxValToUse = parseFloat(maxVal) ; }
					}
					
					
					// calculate scaling value for x-axis based on maxVal					
					var	xScale = (xAxis.xEnd - xAxis.xStart) / MaxValToUse;	
					
					
					// determine frequency of ticks on x-axis based on MaxValToUse
					if ( MaxValToUse >= 0 ) { tickFrequency = 1; }
					if ( MaxValToUse >= 10 ) { tickFrequency = 3; }
					if ( MaxValToUse >= 25 ) { tickFrequency = 4; }
					if ( MaxValToUse >= 50 ) { tickFrequency = 10; }
					if ( MaxValToUse >= 75 ) { tickFrequency = 20; }
					
					
					
					// draw ticks and labels for x-axis
					for ( var i=0; i<=MaxValToUse; i++ )
					{			
					
										
						// does tick/label need to be drawn?
						if ( (i)%tickFrequency==0 )
						{
							
							// calculate specific x-coordinate for label/tick 
							var xVal = (xAxis.xStart+(xScale*i));
							var numZeros;
							
							var prefix = d3.formatPrefix(i);
							
							// http://en.wikipedia.org/wiki/Metric_prefix
							if(prefix.symbol=="")
							{
								numZeros = 0;
							}
							if(prefix.symbol==="k")
							{
								numZeros = 3;
							}
							if(prefix.symbol==="M")
							{
								numZeros = 6;
							}
							if(prefix.symbol==="G")
							{
								numZeros = 9;
							}
							if(prefix.symbol==="T")
							{
								numZeros = 12;
							}
							
//							
//							var valnew = addCommas(i);
							var valnew = i.toString();
							valnew = valnew.slice(0,valnew.length-numZeros);
							
							
							
							// draw tick value						
							d3.select("#mainChart")
								.append("text")
								.attr("class","xAxisLabels")
								.text(valnew)
								.attr("x", xVal-3 )
								.attr("y", yAxis.yStart+15 )
								.attr("fill", "#909090")
								.attr("font-size", "8");					
					
					
							// draw tick marks	
							d3.select("#mainChart")
								.append("line")
								.attr("class","xAxisTicks")
								.attr("x1", xVal)
								.attr("y1", yAxis.yStart+5)
								.attr("x2", xVal)
								.attr("y2", yAxis.yStart)
								.attr("stroke", "#909090")
								.attr("stroke-width", "2px");		
						}
					}
									
									
					// draw maximum data value determined from all GEOUNIT's datasets at right end of x-axis 
					d3.select("#mainChart")
						.append("text")
						.attr("id", "maxVal")
						.text(/*MaxValToUse.toFixed(1) + " " + variableUnitSymbol[selectedDatasetIndex]*/"")
						.attr("x", xAxis.xEnd+5 )
						.attr("y", yAxis.yStart )
						.attr("fill", "#909090")
						.attr("font-size", "12");
	
						
					// draw variable unit string underneath x-axis									
					d3.select("#mainChart")
						.append("text")
						.attr("id","xAxisTitle")
						.text(variableUnitGraphDetailsXAxis[0])
/*						.text(variableUnitGraphDetailsXAxis[selectedDatasetIndex])*/
						.attr("x", 300 )
						.attr("y", yAxis.yStart+25 )
						.attr("fill", "#909090")
						.attr("font-size", "8");						
					
					
					// determine number of data variables to skip drawing graph bards for in 'details' graph
					var count = 0;
					var count_deficit = 0;				
					for( var i=0; i<skippedVariables.length; i++ )
					{
				    	if( skippedVariables[i] == 1 ) { count++; }
					}
					
					var count_deficit = 0;
					
					// initialise and calculate size and spacing values based on number of datasets
					// considered and number to exclude from drawing
					var vertGap = ((1/(NumberOfDataSets-count)).toFixed(1))*10;	
					var barHeight = ((yAxis.yStart - yAxis.yEnd) / (NumberOfDataSets-count))-(vertGap*2);	
					
					var barColor = "#C8C8C8";
					var horiBarColor = "#FFF";
					var highlightBar;
														
					
					// for each dataset															
					for (var i=0; i<NumberOfDataSets; i++ )
					{									
					
					
						// refernece array denoting of dataset should be excluded from drawing .... if value == 1 , ship iteration
						if ( skippedVariables[i] == 1 )
						{
							count_deficit++;
							continue;
						}
						
						
						// set GEOUNITs specific value to local variable
						var value = selectedGEOUNITVariables[i];
						
						
						// calculate scaled value for data value						
						var scaledValue = Number(parseFloat(value) * ((xAxis.xEnd-xAxis.xStart)/parseFloat(MaxValToUse)));
											
											
						// if this value is a true usable value (not null/undefined)
						if( value != null )
						{
							
							// if selected dataset is equal to iteration through dataset listing, highlight graph bar with colorbrewer.js colour
							if ( i == selectedDatasetIndex )
							{
								
								
								// redefine bar color since this is the selected dataset 
								barColor = getColor(value, "drawTimeSeries");
								
								
								// draw highlight-coloured bar	
								d3.select("#mainChart")
									.append("rect")
									.attr("class", "GEOUNITRectGroup")
									.attr("x", xAxis.xStart )
									.attr("y", yAxis.yEnd+((i-count_deficit)*(barHeight+(2*vertGap))) )
									.attr("width", scaledValue )
									.attr("height", barHeight )
									.attr("stroke", "#E00000")
									.attr("fill", barColor)
									.attr("opacity", $('#opacitySlider').slider('value') )
									.attr("stroke-width", "0")
									.attr("z-index", 0);
							}
							
							
							// data bar relates to non-selected dataset, so draw as solid grey
							else
							{
								d3.select("#mainChart")
									.append("rect")
									.attr("class", "GEOUNITRectGroup")
									.attr("x", xAxis.xStart )
									.attr("y", yAxis.yEnd+((i-count_deficit)*(barHeight+(2*vertGap))) )
									.attr("width", scaledValue )
									.attr("height", barHeight )
									.attr("stroke", "#E00000")
									.attr("fill", barColor)
									.attr("opacity",  $('#opacitySlider').slider('value'))
									.attr("stroke-width", "0")
									.attr("z-index", 0);
							}
							
								
							// draw dataset trendLine for each datase for sepected GEOUNIT
							d3.select("#mainChart")
								.append("line")
								.attr("class","trendLines")
								.attr("x1", xAxis.xStart+(xScale*trendLine[i][selectedYearIndex]) )
								.attr("y1", yAxis.yEnd+((i-count_deficit)*(barHeight+(2*vertGap))) )
								.attr("x2", xAxis.xStart+(xScale*trendLine[i][selectedYearIndex]) )
								.attr("y2", yAxis.yEnd+((i-count_deficit)*(barHeight+(2*vertGap))) + barHeight )
								.attr("stroke", compColour)
								.attr("stroke-width", "2")
								.attr("opacity", opcty);															
	
	
							// draw mini legend example trend line to right of graphing area
							d3.select("#mainChart")
								.append("line")
								.attr("id","trendInfoLine")
								.attr("x1", xAxis.xEnd)
								.attr("y1", (yAxis.yStart-yAxis.yEnd)/2+17)
								.attr("x2", xAxis.xEnd)
								.attr("y2", (yAxis.yStart-yAxis.yEnd)/2+37)
								.attr("stroke", compColour)
								.attr("stroke-width", "2");															
	
	
							// draw mini legend text to right of graphing area
							d3.select("#mainChart")
								.append("text")
								.attr("id","trendInfoLabel1")
								.text(geoCoverageAbbrev)
								.attr("x", xAxis.xEnd+5 )
								.attr("y", (yAxis.yStart-yAxis.yEnd)/2+30 )
								.attr("fill", "#909090")
								.style("font-size", "10")
								.attr("font-weight", "normal");															
	
	
							// draw mini legend text to right of graphing area
							d3.select("#mainChart")
								.append("text")
								.attr("id","addText")
								.text(addText)
								.attr("x", xAxis.xEnd+18 )
								.attr("y", (yAxis.yStart-yAxis.yEnd)/2+30 )
								.attr("fill", "#909090")
								.attr("font-size", "10")
								.attr("font-weight", "normal");															
	
	
							// draw mini legend example trend line to right of graphing area
							d3.select("#mainChart")
								.append("text")
								.attr("id","trendInfoLabel2")
								.text("")
								.attr("x", xAxis.xEnd+5 )
								.attr("y", (yAxis.yStart-yAxis.yEnd)/2+35)
								.attr("fill", "#909090")
								.attr("font-size", "9")
								.attr("font-weight", "normal");															
	
	
							// draw dataset variable values alongside y-axis
							d3.select("#mainChart")
								.append("text")
								.attr("class","GEOUNITDataLabels")
								.text(value.toFixed(1))
								.attr("x", xAxis.xStart-28 )
								.attr("y", (yAxis.yEnd+((i-count_deficit)*(barHeight+(2*vertGap)))+(barHeight/2))+3 )
								.attr("fill", "#909090")
								.attr("font-size", "10");															
	
	
							// draw abbreviated dataset variable name alongside y-axis
							d3.select("#mainChart")
								.append("text")
								.attr("class","DatasetLabels")
								.text(abrrevdrop[i])
								.attr("x", xAxis.xStart-100 )
								.attr("y", (yAxis.yEnd+((i-count_deficit)*(barHeight+(2*vertGap)))+(barHeight/2))+3 )
								.attr("fill", "black")
								.attr("font-size", "10");							
						}														


						// otherwise selected GEOUNIT name has no data to report					
						else
						{															
	
	
							// draw abbreviated dataset variable name alongside y-axis
							d3.select("#mainChart")
								.append("text")
								.attr("class","DatasetLabels")
								.text(abrrevdrop[i])
								.attr("x", xAxis.xStart-100 )
								.attr("y", (yAxis.yEnd+((i-count)*(barHeight+(2*vertGap)))+(barHeight/2))+3 )
								.attr("fill", "black")
								.attr("font-size", "10");
								
																						
							// draw text inplace of non-existent value bar.
							d3.select("#mainChart")
								.append("text")
								.attr("class","GEOUNITNoDataLabels")
								.text("No data available")
								.attr("x", xAxis.xStart+5 )
								.attr("y", (yAxis.yEnd+((i-count)*(barHeight+(2*vertGap)))+(barHeight/2))+3  )
								.attr("fill", "black")
								.attr("font-size", "12");
						}
						
						
						// reset barcolor to default grey
						barColor = "#C8C8C8";
						
						
						// draw	x-axis
						d3.select("#mainChart")	
							.append("line")
							.attr("id","xAxis")
							.attr("x1", xAxis.xStart)
							.attr("y1", xAxis.yStart)
							.attr("x2", xAxis.xEnd+1)
							.attr("y2", xAxis.yEnd)
							.attr("stroke", "#909090")
							.attr("stroke-width", "1");	
						
						
						// draw	y-axis
						d3.select("#mainChart")
							.append("line")
							.attr("id","yAxis")
							.attr("x1", yAxis.xStart)
							.attr("y1", yAxis.yStart)
							.attr("x2", yAxis.xEnd)
							.attr("y2", yAxis.yEnd)
							.attr("stroke", "#909090")
							.attr("stroke-width", "1");
					}							
					
				} // END DRAWING OF DETAILS BAR GRAPH
				
				
				// else do nothing .. 
				else
				{
					
				}
								
				return;
				
			
			}//end drawTimeSeries
						
			
				
			/*
				NAME: 			getParams
				DESCRIPTION: 	deconstructs URL for the current display into component elements to allow iFrame strings for embedding and posting to Twitter/FB to be built
				CALLED FROM:	loadDisplay
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function getParams()
			{	
			
			
				// extract URL. Split and retain part preceding '.html'
				firstbit = window.location.href.split(".html")[0];
				var url = decodeURI(window.location.hash);
				
				
				// if URL exists..
				if(url != "")
				{
					
					
					// split URL into component parts and store as gobal variables to allow users to mail specific screen image/settings
					params = url.split("/");
					zoom = parseInt(params[0].split("#")[1]);
					centerLat = params[1];	
					centerLong = params[2];	
					selectedDataset = params[3];	
					selectedYear = params[4];			
					opcty = params[5];		
					numColorDivs = params[6];
					palette = params[7];
					splitType = params[8];
					graphType = params[9];
					rangeType = params[10];
				}
				
		
			}// end getParams()
						
			
				
			/*
				NAME: 			urli
				DESCRIPTION: 	constructs alternate tiny URL for posting to Twitter
				CALLED FROM:	loadDisplayloadDisplay
								drawUI
								reint
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function urli()
			{
				
				
				// construct ifrmae string to allow embedding information to be placed in email
				statsdata2 = '<iframe width=940 height=660 src="' + firstbit + '.html?mode=clean' + window.location.hash + '" scrolling=no frameborder=0/>';
				
				
			}// end urli()
						
			
				
			/*
				NAME: 			makeTinyUrl
				DESCRIPTION: 	constructs alternate tiny URL for posting to Twitter
				CALLED FROM:	map.html (file)
				CALLS:			post2Twitter
 				REQUIRES: 		shortURL
				RETURNS: 		n/a
			*/
			function makeTinyUrl()
			{
				
				
				// convert long URL to short version if required
				var longUrl = document.URL;		
				$.shortenUrl(longUrl, function(short_url) { post2Twitter(short_url); });
				
				
			}// makeTinyUrl()
						
			
				
			/*
				NAME: 			post2Twitter
				DESCRIPTION: 	constructs URL for posting to Twitter
				CALLED FROM:	makeTinyUrl
				CALLS:			n/a
 				REQUIRES: 		shortURL
				RETURNS: 		n/a
			*/
			function post2Twitter(shortURL)	
			{
				
				
				// construct URL for posting application/image to Twitter
				var myLoc = "of England & Wales";			
				var myString="http://twitter.com/home?status="+escape("#census #map "+shortURL+" via @statisticsONS #visualization #onsdvc");			
				window.open(myString);
				
			
			}// end post2Twitter(shortURL)	
						
			
				
			/*
				NAME: 			swapout
				DESCRIPTION: 	detemines if long or short version of URL is required.
				CALLED FROM:	???
				CALLS:			n/a
 				REQUIRES: 		element
								URLTextBox
				RETURNS: 		n/a
			*/
			function swapout(element, URLTextBox)
			{
				
				
				//get the state of the check box	
				if (element.checked == true)
				{	
				
				
					// extract URL value
					var longUrl = document.URL;			
					$.shortenUrl(longUrl, function(short_url) {
			
						element.setAttribute('rel',document.getElementById(URLTextBox).value)
			
						document.getElementById(URLTextBox).value = short_url
			
						}
					);
				}	
				else
				{	
					document.getElementById(URLTextBox).value = window.location.href;
				}
					
				
			}// end swapout(element, URLTextBox)
						
			
				
			/*
				NAME: 			makeFace
				DESCRIPTION: 	constructs text string for sending and posting to FaceBook profile.
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function makeFace()
			{
				
				
				// construct URL to allow embedding to Facebook
				var face = 'http://www.facebook.com/share.php?u=' + window.location.href;
				window.open(face);
				
				
			}// end makeFace()
						
			
				
			/*
				NAME: 			showEmbed
				DESCRIPTION: 	reveals embed frame 
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function showEmbed()
			{
				
				// show embed box dialog. populate contained text box with URL information
				$('#embedurl').val(statsdata2);
				$('#embedurl2').val(document.URL);
				$('#embedbox').show(400);
			
			
			}// end showEmbed()
						
			
				
			/*
				NAME: 			embedHide
				DESCRIPTION: 	Close embed box on clicking white cross, upper-right corner of frame
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function embedHide()
			{
				
				// hide embed box dialog
				$('#embedbox').hide(400);
				
				
			}// end embedHide()	
						
			
				
			/*
				NAME: 			showinfo
				DESCRIPTION: 	reveals right-hand 'Metadata' frame 
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function showinfo()
			{	
			
				// show metadata information box/right-hand panel
				$('#infobox').show(400);
						
						
			}// end showinfo()
						
			
				
			/*
				NAME: 			infoHide
				DESCRIPTION: 	Close metadata on clicking white cross, upper-right corner of frame
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function infoHide()
			{
				
				// hide information/metadata panel
				$('#infobox').hide(400);
				
				
			}// end infoHide()
						
			
				
			/*
				NAME: 			grabFixedDataDivisions
				DESCRIPTION: 	grabs and stores curent data divisions if user wants to fixed data bands of legend on specific values while using "within year" for data limits to map against
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		src - indicator defining from which function/HTML element this function was called. Processing differs depending on route into this functio
				RETURNS: 		n/a
			*/
			function grabFixedDataDivisions(src)
			{
				
				
				// if function called from anywhere other than 'Fix data ranges' check box
				if ( src == 'dv' || src == 'sp' || src == 'di'  )
				{
					
					
					// hide or set to false specific elements since route into function was via 'dv-drop'
					document.getElementById('fixedRanges').checked = false;
					fixedValCheck = document.getElementById('fixedRanges').checked;
					$( "#fixedDivisions1" ).css( "display", "none" );
					$( "#fixedDivisions2" ).css( "display", "none" );
					$( "#fixedDivisionsBg" ).css( "display", "none" );
				}
				
				
				// if function called from than 'Fix data ranges' check box				
				else
				{
	
				
					// 	get boolean state of fixedRanges checkbox
					fixedValCheck = document.getElementById('fixedRanges').checked;
				}
				
				
				// copy contents of 'divisions' array to alternate array if 'fixedRanges' == true
				if ( fixedValCheck == true )
				{	
					fixedDataRanges = divisions; 					
					
					document.getElementById('fixedYear').innerHTML = "(" + selectedYear + ")";
					var fixedDataBands = selectedYear;
					
					document.getElementById('fixedDivisions1').innerHTML = "Variable mapped to "+ fixedDataBands;
					document.getElementById('fixedDivisions2').innerHTML = "data divisions";
					
					$( "#fixedYear" ).css( "display", "inline" );
					$( "#fixedDivisions1" ).css( "display", "inline" );
					$( "#fixedDivisions2" ).css( "display", "inline" );
					$( "#fixedDivisionsBg" ).css( "display", "inline" );
				}
				else
				{
					fixedDataRanges = [];
					$( "#fixedYear" ).css( "display", "none" );
					$( "#fixedDivisions1" ).css( "display", "none" );
					$( "#fixedDivisions2" ).css( "display", "none" );
					$( "#fixedDivisionsBg" ).css( "display", "none" );					
					
					reint();
				}	
							
				
				return;				
				
				
			}// end grabFixedDataDivisions()
						
			
				
			/*
				NAME: 			instructionBoxHide
				DESCRIPTION: 	Close user insrcutions covering Div on clicking white cross, upper-right corner of frame
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function instructionBoxHide()
			{
				
				// hide information/metadata panel
				$('#instructionBox').hide(400);
				
				
			}// end infoHide()
						
			
				
			/*
				NAME: 			showhelp
				DESCRIPTION: 	shows user insructions covering Div on clicking 'help' button in title bar
				CALLED FROM:	map.html (file)
				CALLS:			n/a
 				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function showhelp()
			{	
			
				// show metadata information box/right-hand panel
				$('#instructionBox').show(400);
						
						
			}// end showinfo()
						
			
				
			/*
				NAME: 			addCommas
				DESCRIPTION: 	adds thousands separators to numbers shown on graph.
				CALLED FROM:	drawTimeSeries
				CALLS:			n/a
 				REQUIRES: 		nStr - the value to have separators addded to .
				RETURNS: 		x1 - the updated value to display
			*/
			function addCommas(nStr)
			{
				nStr += '';
				x = nStr.split('.');
				x1 = x[0];
				x2 = x.length > 1 ? '.' + x[1] : '';
				var rgx = /(\d+)(\d{3})/;
				while (rgx.test(x1)) {
						x1 = x1.replace(rgx, '$1' + ',' + '$2');
				}
								
//				return x1 + x2;
				return x1;
				
			}// end function adCommas 
						
		
			
			