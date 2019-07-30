/*

	FILENAME: CONFIG.JS
	
	INTENDED USE WITH: DVC174 JMAP: Population data by Parliamentary Constituencies
	
	DESCRIPTION: This parameter file contains all initialisation parameters that cannot be detemined from the input data
*/
	
	// ELEMENT NUMBER 1
	var LeadInQuestion = "How do parliamentary constituencies vary in Great Britain?";
	
	
	// ELEMENT NUMBER 2
	
	
//	

	var intro = 
	"</br>This interactive map allows you to explore a selection of statistics for the parliamentary constituency of your choice. It includes data for all the Westminster constituencies in England, Wales and Scotland. The variables have been chosen from a broad range of datasets available at GB level, as listed in our " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/guide-method/user-guidance/parliamentary-constituencies/data-catalogue-for-parliamentary-constituencies/index.html" target="_blank">' + "data catalogue" + '</a>' + ". In this latest release the six statistics presented are:</br></br>"+
	"<li>proportion of the population aged 65 years and over, " + 
	"<li>state pension claimant rate,  " +
	"<li>general ‘good’ health rate, " +
	"<li>the proportion of the population identified as ‘non-white’, " +
	"<li>employment rate, aged 16-64; and "  +
	"<li>number of business enterprises per 10,000 residents."  +
	"</br></br>The statistics presented here are the latest comparable figures as available in mid August 2014.."+
	"</br></br>A " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/rel/regional-trends/area-based-analysis/statistics-for-parliamentary-constituencies-in-great-britain--september-2014/sty--pcon-story.html" target="_blank">' + "short story" + '</a>' + " describes how constituencies differ. </br></br>";
	
	
	
	// ELEMENT NUMBER 3
	var intermediateTitle = "Statistics for parliamentary constituencies in England, Wales and Scotland";
	
	
	// ELEMENT NUMBER 4
	var Title = [
					"Usual resident population, 65 years+",
					"State pension claimant rate",
					"Usual resident population in ‘good’ health",
					"'Non-white’ usual resident population",
					"Employment rate, aged 16-64",
					"Business enterprises per 10,000 residents"
			];
				
	
	
	// ELEMENT NUMBER 5
	var sourceInfo = [
						"Source: 2012 Mid Year Population Estimates by Parliamentary Constituency, Office for National Statistics",
						"Source: State Pension 2014, Department for Work and Pensions",
						"Source: Census 2011, Office for National Statistics",
						"Source: Census 2011, Office for National Statistics",
						"Source: Regional Labour Market Ll02 Indicators, (April 2013 to March 2014), Office for National Statistics",
						"Source: UK Business Counts 2013 – Enterprises, Office for National Statistics"
					 ];
					
				
	// ELEMENT NUMBER 6
	var geoCoverage = " England, Wales and Scotland";
	
	
	 // ELEMENT NUMBER 9 (KEEP the word "by " in the rtext string...)
	var geoUnits = "by Parliamentary Constituencies";
	var geoUnit = "Parliamentary Constituencies";
					
				
	// ELEMENT NUMBER 10
	// No Business area definition required. Use standard ONS abbreviation (e.g. EW, EN, GB, UK ... )
	var geoCoverageAbbrev = "GB";
	
				
	// ELEMENT NUMBER 11		
	var addText = "";		
					
				
	// ELEMENT NUMBER 12		
	var zoom = 5; // initial zoom level of map (can be altered to suit geographic extent required for data variables)		
					
				
	// ELEMENT NUMBER 13			
	var centerLong = -2.5048828125; // initial centered longitude of map (can be altered to suit geographic extent required for data variables)		
					
				
	// ELEMENT NUMBER 14			
	var centerLat = 55.94919982336746; // initial centered latitude of map (can be altered to suit geographic extent required for data variables)	
				
					
	
	// ELEMENT NUMBER 15 (if datasets are WITH a time-series, and SAME data theme ... ) 
	var startYear = 2011;
	
	
	// ELEMENT NUMBER 16 (if datasets are WITHOUT a time-series, and DIFFERENT, disparate data theme ... )  
	var singleYearDatasetsYears = [
		"2012",
		"February 2014",
		"2011",
		"2011",
		"April 2013-March 2014",
		"2013"
	];
	
	
	// ELEMENT NUMBER 17 (if datasets are WITH a time-series, and SAME data theme ... ) 
	var	endYear = 2011;
	
	
    // ELEMENT NUMBER 18 (if datasets are WITH a time-series, and SAME data theme ... ) 
	var yearInterval = 1;
	
	
	// ELEMENT NUMBER 19
	// this is an array of data value names that the customer wants presented in teh data variable selection list.
	// its length must equal the number of sub-arrays of data provided for each GEOUNIT
	var drop = [
			"Population, aged 65 years+",
			"State pension claimants",
			"Population in ‘good’ health",
			"'Non-white’ population",
			"Employment rate, aged 16-64",
			"Business enterprises"
	];
	
	
	// ELEMENT NUMBER 20
	// Changes with change in selected data variable shown.	
	// its length must equal the length of ELEMENT NUMBER 19			
	var abrrevdrop = [
			"65 years+",
			"State pension",
			"'Good' health",
			"'Non-white'",
			"Employment",
			"Businesses"
	];
				
		
	// ELEMENT NUMBER 21 ... 
	// Limigted to about 2,000 characters per data variable text string (do not include hyperlink characters unless you want to visual show web address).
	// Changes with change in selected data variable shown.		
	var metadata = [			

				"The population variable is based on " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/rel/sape/parliament-constituency-pop-est/mid-2012/stb---parliamentary-constituencies-pop-estimates--mid-2012.html" target="_blank">' + "2012 Mid Year Population Estimates" + '</a>' + ", aged 65 years and above for parliamentary constituencies in England and Wales, published in November 2013 and " + '<a class="metadataLink" href="http://www.gro-scotland.gov.uk/statistics/theme/population/estimates/special-area/ukpc.html" target="_blank">' + "2012 UK Parliamentary Constituency Population Estimates" + '</a>' + " published for Scotland, in December 2013." + 
				"</br></br>The percentage rate of the usual resident population, aged 65 years and over is calculated using the total (all ages) usual resident population as the denominator in each parliamentary constituency."
				
				,
				
				"The state pension variable available via " + '<a class="metadataLink" href="https://www.nomisweb.co.uk/" target="_blank">' + "NOMIS" + '</a>' + " includes total benefit claimants (all combinations of state pension) and all ages, as at February 2014. "+
				"</br></br>The percentage rate is calculated using the total (all ages) " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/rel/sape/parliament-constituency-pop-est/mid-2012/stb---parliamentary-constituencies-pop-estimates--mid-2012.html" target="_blank">' + "2012 Mid Year Population Estimates" + '</a>' + " for parliamentary constituencies in England and Wales and  " + '<a class="metadataLink" href="http://www.gro-scotland.gov.uk/statistics/theme/population/estimates/special-area/ukpc.html" target="_blank">' + "2012 UK Parliamentary Constituency Population Estimates" + '</a>' + " in Scotland, for each constituency. "
				
				,

				"The ‘good’ health variable is based on the 2011 Census in England and Wales 'General health' table QS302EW published on " + '<a class="metadataLink" href="https://www.nomisweb.co.uk/" target="_blank">' + "NOMIS" + '</a>' + " and Scotland’s Census 2011 table QS302SC published on Scotland’s Census 2011-" + '<a class="metadataLink" href="http://www.scotlandscensus.gov.uk/ods-web/home.html" target="_blank">' + "Census Data Explorer" + '</a>' + "."+
				"</br></br>The ‘good’ health rate is the proportion of usual residents in each parliamentary constituency who reported themselves as having 'Very Good' or 'Good' general health as a percentage of the total of all usual residents in each constituency. "
				
				,

				"The 'non-white' ethnicity variable is based on the 2011 Census in England and Wales KS201EW ‘Ethnic Group' published on " + '<a class="metadataLink" href="https://www.nomisweb.co.uk/" target="_blank">' + "NOMIS" + '</a>' + " and Scotland’s Census 2011 table KS201SC published on Scotland’s Census 2011-" + '<a class="metadataLink" href="http://www.scotlandscensus.gov.uk/ods-web/home.html" target="_blank">' + "Census Data Explorer" + '</a>' + "."+
				"</br></br>The ‘non-white’ percentage rate is the proportion of all respondents in the 2011 Census who did not identify themselves as one of the following four categories: White: English/Welsh/Scottish/Northern Irish/British, White: Gypsy or Irish Traveller, White: Irish, White: Other White as a percentage of the total of all usual residents in each constituency. "+
				"</br></br>The ‘non-white’ variable includes ‘mixed/multiple’ ethnic groups that include white and ‘other ethnic’ groups. "
				
				,
				
				"The employment rate, aged 16 to 64 is from the " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/publications/re-reference-tables.html?edition=tcm%3A77-317153" target="_blank">' + "UK Regional Labour Market: LI02 Local Indicators for Parliamentary Constituencies" + '</a>' + ", published in July 2014." + 
				"</br></br>The employment rate is calculated on  the total estimate of 16-64 year-olds by parliamentary constituency for England and Wales from the " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/rel/sape/parliament-constituency-pop-est/mid-2012/stb---parliamentary-constituencies-pop-estimates--mid-2012.html" target="_blank">' + "2012 Mid Year Population Estimates" + '</a>' + " and the total estimate of 16-64 year-olds in Scotland from the " + '<a class="metadataLink" href="http://www.gro-scotland.gov.uk/statistics/theme/population/estimates/special-area/ukpc.html" target="_blank">' + "2012 UK Parliamentary Constituency Population Estimates" + '</a>' + "."
				
				,
				
				"In this publication the term business refers to an enterprise. Enterprise is the smallest combination of legal units (generally based on VAT and/or PAYE records) which has a certain degree of autonomy within an Enterprise Group. The enterprises dataset is taken from the " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/rel/bus-register/uk-business/2013/index.html" target="_blank">' + "UK Business: Activity, Size and Location, 2013" + '</a>' + " (compiled from the Inter Departmental Business Register (IDBR)). " +

"</br></br>This variable is available via " + '<a class="metadataLink" href="https://www.nomisweb.co.uk/" target="_blank">' + "NOMIS" + '</a>' + " as UK Business Counts and includes total enterprises for 2013. The  " + '<a class="metadataLink" href="http://www.ons.gov.uk/ons/rel/sape/parliament-constituency-pop-est/mid-2012/stb---parliamentary-constituencies-pop-estimates--mid-2012.html" target="_blank">' + "2012 Mid Year Population Estimates" + '</a>' + " for England and Wales and the  " + '<a class="metadataLink" href="http://www.gro-scotland.gov.uk/statistics/theme/population/estimates/special-area/ukpc.html" target="_blank">' + "2012 UK Parliamentary Constituency Population Estimates" + '</a>' + " for Scotland were used to calculate the number of businesses per 10,000 residents."
	];
		
	
	// ELEMENT NUMBER 23 ... 
	// If MULITPLE, SINGLE-YEAR dataset, format as ...
	// var trendLine =
	//				[
	//						[ 1.0 ],
	//						[ 2.0 ],
	//						[ 3.0 ],
	//						....,
	//						[ N.N ]
	//				];
	//
	// If MULTIPLE dataset MULTPLE YEARS, format as ...
	// var trendLine = [
	//						[ 1.0, 2,0, 3.0, ...., N ],
	//						[ 1.0, 2,0, 3.0, ...., N ],
	//						[ 1.0, 2,0, 3.0, ...., N ]
	//						,... ,
	//						[ 1.0, 2,0, 3.0, ...., N ]	
		//				];

	var trendLine =
	[	
		
		[17.1],
		[18.9],
		[80.5],
		[13.2],
		[71.7],
		[339.5]
		
	];
	
	
	// ELEMENT NUMBER 24 ...
	// 1 = skipped, and excluded from being illustrated on "Details" graph
	// 0 = retained and shown on 'Details' graph
	// One element per dataset, order as listed in 'dv-drop' and on y-axis of 'Details' graph
	var skippedVariables = [ 0, 0, 0, 0, 0, 1 ];
						
	
	
	// ELEMENT NUMBER 25
	// Variable needs to defined, even if BA does not want/use custom data divisions. Values must be in ascending order, left to right, and must be applicable to all data variables to be presented.
	// If not required, empty array should be define
	// Otherwise, if required, 1-dimension array with between 2 and 8 integer or decimal numbers should be provided, e.g. var customDivisions = [ 5.0, 10.0, 15.0, 20.0, 25.0 ];
	var customDivisions = [ ];	
					

	// ELEMENT NUMBER 26	
	// Dynamic text variables to show at top-left of legend/simple count graph.
	// Can't be too long, or will interfere with other interface elements.
	// Changes with change in selected data variable shown.
	var variableUnitSymbol =
					[
						"%",
						"%",
						"%",
						"%",
						"%",
						" Units per 10,000 residents"

					];
	

	// Elements 27
	// Dynamic text variables to show horizontally at top of Y-Axis on Rank graph.
	// Changes with change in selected data variable shown.
	var variableUnitGraphRankSelectedValue = 
					[
						"%",
						"%",
						"%",
						"%",
						"%",
						" Units per 10,000 residents"
					];
						
	
	
	// ELEMENT NUMBER 28
	// Dynamic text variables to show at lower-left of "Details" graph.
	// Changes with change in selected data variable shown.
	var variableUnitGraphDetailsXAxis = 
					[
						"%",
						"%",
						"%",
						"%",
						"%",
						" Units per 10,000 residents"
					];
						
	
	
	// ELEMENT NUMBER 29
	// Dynamic text variables to show horizontally at top of Y-Axis on time-series graph.
	// Changes with change in selected data variable shown.
	var variableUnitGraphYAxis =
					[
						"%",
						"%",
						"%",
						"%",
						"%",
						" Units per 10,000 residents"
					];
						
	
	
	// ELEMENT NUMBER 30
	// Dynamic text variables to show at top-left of legend/simple count graph.
	// Can't be too long, or will interfere with other interface elements.
	// Changes with change in selected data variable shown.
	var variableUnitLegend =
					[
						"%",
						"%",
						"%",
						"%",
						"%",
						" Units per 10,000 residents"
					];
					
					
	// ELEMENT NUMBER 32
	// Can take any of the following values:
	// Oranges, Blues, Reds, Greens, Purples, Pinks	
	var onLoadPalette = "Greens";
	
		
	// ELEMENT NUMBER 33	
	var tabTitle = "2010 Parliamentary Constituencies";


	// ELEMENT NUMBER 34
	var innerTabTitle = "2010 Parliamentary Constituencies";
	
	
	// ELEMENT NUMBER 35
	var wrapperTabTitle = "2010 Parliamentary Constituencies";						
	
	
	// ELEMENT NUMBER 36
	// Define precision torleance of data variables being presented. 
	// Uusually won't need to alter. Typically to 0.1 precision.
	var presentationTolerance = 0.1;
	
	
	
	// Variables listed below here should be be altered
	
/*	ONLY TO BE COMPLETED BY DVC. REQUIRED IF DATA SIZE RESULTS IN SLOW DATA LOAD/REFRESH WHEN USING NATURAL JENKS AALGORITHM.
	If required this needs to be populated with 9 sub-arrays. The first two should be unpopulated.
	Then each subsequent one should have one more element that the previous array, starting with 2 elements in sub-array #3.
	These values represent the Natural Jenks division values for 2 to 8 data bands.
	
		e.g. 
	
			var NJbreaks = [
							[ ],
							[ ],
							[7.6,39.8],
							[7.6,31.7,48.2],
							[7.6,28.4,41.2,55.7],
							[7.6,25.9,36.3,47.1,60.1],
							[7.6,23.6,31.9,40.5,50,62.3],
							[7.6,22.9,30.6,38.2,46.4,55.4,67.3],
							[7.6,22,29,35.6,42.4,49.9,58.7,70.9]
			];	
*/	
	var NJbreaks = [ ]; 
	
	
	
	// Possible future variables required for building an Index-style graph in-place of standard 'Details' graph (for eg.g. GVA, GDP)
	isIndexGraph = false;
	xAxisMin = 50;
	xAxisMax = 200;
	YAxisCrossPoint = 100;
	
	
	var colours = ['Oranges','Blues','Reds','Greens','Greys','Purples','Pinks']; 
	var splittype = [ 'Equal Intervals', 'Natural Jenks', 'Quantiles']; 	 
	var datalimits = ['Across years', 'Within year']; 
	var divisionNumber = ['8', '7', '6', '5', '4' ,'3' ,'2'];	
	var drop6 = ['Rank'];
				
	var arrayNames = ['ARRAY01', 'ARRAY02', 'ARRAY03', 'ARRAY04', 'ARRAY05', 'ARRAY06', 'ARRAY07', 'ARRAY08', 'ARRAY09', 'ARRAY10', 'ARRAY11', 'ARRAY12', 'ARRAY13', 'ARRAY14', 'ARRAY15', 'ARRAY16'];
	var arrayMinNames = ['MINARRAY01', 'MINARRAY02', 'MINARRAY03', 'MINARRAY04', 'MINARRAY05', 'MINARRAY06', 'MINARRAY07', 'MINARRAY08', 'MINARRAY09', 'MINARRAY10', 'MINARRAY11', 'MINARRAY12', 'MINARRAY13', 'MINARRAY14', 'MINARRAY15', 'MINARRAY16'];
	var arrayMaxNames = ['MAXARRAY01', 'MAXARRAY02', 'MAXARRAY03', 'MAXARRAY04', 'MAXARRAY05', 'MAXARRAY06', 'MAXARRAY07', 'MAXARRAY08', 'MAXARRAY09', 'MAXARRAY10', 'MAXARRAY11', 'MAXARRAY12', 'MAXARRAY13', 'MAXARRAY14', 'MAXARRAY15', 'MAXARRAY16'];
	var arrayTotalNames = ['TOTALARRAY01', 'TOTALARRAY02', 'TOTALARRAY03', 'TOTALARRAY04', 'TOTALARRAY05', 'TOTALARRAY06', 'TOTALARRAY07', 'TOTALARRAY08', 'TOTALARRAY09', 'TOTALARRAY10', 'TOTALARRAY11', 'TOTALARRAY12', 'TOTALARRAY13', 'TOTALARRAY14', 'TOTALARRAY15', 'TOTALARRAY16'];

	var EffectiveGEOUNITCount = [];
	var nulledGEOUNITCount = [];
	var numColorDivs = 5;
	var palette = 'Green';
	var splitType = 'Natural Jenks';
	var rangeType = 'Across years';


