/**
 * Init.js
 * Initilization of the Application
 *
 * @module   Init.js
 * @author  Randy Lebeau
 *
 */

var React = require('react'),
	App = require('./App');


// Display React Tools in dev
if(process.env.NODE_ENV !== 'production') {
	global.React = React;
}


// Render Application
(function() {

	React.render(

		<App />,
		document.getElementById('app-container'),
		function() {
			// Callback after Render
		}
	);

})();
