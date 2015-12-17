/**
 * Init.js
 * Initilization of the Application
 *
 * @module   Init.js
 * @author  Randy Lebeau
 *
 */

import React from 'react'
import { render } from 'react-dom'
import App from './App'

render(<App />, document.getElementById('app-container'), () => console.log('Rendered!'))
