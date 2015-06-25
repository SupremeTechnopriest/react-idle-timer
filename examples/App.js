import React from 'react';
import IdleTimer from '../src/index';

export default React.createClass({

	displayName: 'App',

	render() {

		return(
			<IdleTimer>
				<div><h1>a child</h1></div>
			</IdleTimer>
		);
	}

});
