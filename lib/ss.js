// # simple-statistics
//
// A simple, literate statistics system. The code below uses the
// [Javascript module pattern](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth),
// eventually assigning `simple-statistics` to `ss` in browsers or the
// `exports object for node.js
(function() {
    var ss = {};
 
    if (typeof module !== 'undefined') {
        // Assign the `ss` object to exports, so that you can require
        // it in [node.js](http://nodejs.org/)
        exports = module.exports = ss;
    } else {
        // Otherwise, in a browser, we assign `ss` to the window object,
        // so you can simply refer to it as `ss`.
        this.ss = ss;
    }
 
    // Compute the matrices required for Jenks breaks. These matrices
    // can be used for any classing of data with `classes <= n_classes`
    ss.jenksMatrices = function(data, n_classes) {
 
        // in the original implementation, these matrices are referred to
        // as `LC` and `OP`
        //
        // * lower_class_limits (LC): optimal lower class limits
        // * variance_combinations (OP): optimal variance combinations for all classes
        var lower_class_limits = [],
            variance_combinations = [],
            // loop counters
            i, j,
            // the variance, as computed at each step in the calculation
            variance = 0;
 
        // Initialize and fill each matrix with zeroes
        for (i = 0; i < data.length + 1; i++) {
            var tmp1 = [], tmp2 = [];
            for (j = 0; j < n_classes + 1; j++) {
                tmp1.push(0);
                tmp2.push(0);
            }
            lower_class_limits.push(tmp1);
            variance_combinations.push(tmp2);
        }
 
        for (i = 1; i < n_classes + 1; i++) {
            lower_class_limits[1][i] = 1;
            variance_combinations[1][i] = 0;
            // in the original implementation, 9999999 is used but
            // since Javascript has `Infinity`, we use that.
            for (j = 2; j < data.length + 1; j++) {
                variance_combinations[j][i] = Infinity;
            }
        }
 
        for (var l = 2; l < data.length + 1; l++) {
 
            // `SZ` originally. this is the sum of the values seen thus
            // far when calculating variance.
            var sum = 0, 
                // `ZSQ` originally. the sum of squares of values seen
                // thus far
                sum_squares = 0,
                // `WT` originally. This is the number of 
                w = 0,
                // `IV` originally
                i4 = 0;
 
            // in several instances, you could say `Math.pow(x, 2)`
            // instead of `x * x`, but this is slower in some browsers
            // introduces an unnecessary concept.
            for (var m = 1; m < l + 1; m++) {
 
                // `III` originally
                var lower_class_limit = l - m + 1,
                    val = data[lower_class_limit - 1];
 
                // here we're estimating variance for each potential classing
                // of the data, for each potential number of classes. `w`
                // is the number of data points considered so far.
                w++;
 
                // increase the current sum and sum-of-squares
                sum += val;
                sum_squares += val * val;
 
                // the variance at this point in the sequence is the difference
                // between the sum of squares and the total x 2, over the number
                // of samples.
                variance = sum_squares - (sum * sum) / w;
 
                i4 = lower_class_limit - 1;
 
                if (i4 !== 0) {
                    for (j = 2; j < n_classes + 1; j++) {
                        if (variance_combinations[l][j] >=
                            (variance + variance_combinations[i4][j - 1])) {
                            lower_class_limits[l][j] = lower_class_limit;
                            variance_combinations[l][j] = variance +
                                variance_combinations[i4][j - 1];
                        }
                    }
                }
            }
 
            lower_class_limits[l][1] = 1;
            variance_combinations[l][1] = variance;
        }
 
        return {
            lower_class_limits: lower_class_limits,
            variance_combinations: variance_combinations
        };
    };
 
    // # [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
    //
    // Implementations: [1](http://danieljlewis.org/files/2010/06/Jenks.pdf) (python),
    // [2](https://github.com/vvoovv/djeo-jenks/blob/master/main.js) (buggy),
    // [3](https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407) (works)
 
    ss.jenks = function(data, n_classes) {
		
//		n_classes = n_classes - 1;
 
        // sort data in numerical order
        data = data.slice().sort(function (a, b) { return a - b; });
 
        // get our basic matrices
        var matrices = ss.jenksMatrices(data, n_classes),
            // we only need lower class limits here
            lower_class_limits = matrices.lower_class_limits,
//          k = data.length - 1,
//			k = EffectiveGEOUNITCount[selectedDatasetIndex][selectedYearIndex] - 1,			
            kclass = [],
            countNum = n_classes;
			 
//			the calculation of classes will never include the upper and
//			lower bounds, so we need to explicitly set them
//        	kclass[n_classes] = data[data.length - 1];

		if ( document.getElementById('range-drop').value == "Across years" )
		{	
			var totalEffectiveGEOUNITCount = 0;
			
			for (var i=0; i<subDataArrayLength; i++ ) { totalEffectiveGEOUNITCount = totalEffectiveGEOUNITCount + EffectiveGEOUNITCount[selectedDatasetIndex][i]; }

		    k = totalEffectiveGEOUNITCount;
			var indexVal = totalEffectiveGEOUNITCount;
	  		kclass[n_classes] = data[indexVal-1];
			
		}
		else
		{
			k = EffectiveGEOUNITCount[selectedDatasetIndex][selectedYearIndex];
	  		kclass[n_classes] = data[EffectiveGEOUNITCount[selectedDatasetIndex][selectedYearIndex]-1];
		}	
			
   	  	kclass[0] = data[0];
 
 
        // the lower_class_limits matrix is used as indexes into itself
        // here: the `k` variable is reused in each iteration.
       while (countNum > 1) {			
			
            kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
            k = lower_class_limits[k][countNum] - 1;
            countNum--;
        }
		
		divisions = kclass;		
		divisions = divisions.slice(0,divisions.length-1);

//		console.log(divisions);
		
//        return kclass;
        return;
    };
 
})(this);