/**
 * Misc utility methods grouped in objects utils and ajax
 */

jutils = new Object()

jutils.misc = new Object()
jutils.ajax = new Object()
jutils.dom = new Object()
jutils.html = new Object()
jutils.popup = new Object()
jutils.elemens = new Object()
jutils.events = new Object()
jutils.transformations = new Object()
jutils.colors = new Object()

// --------------------------------------------------------------------------------------
// dom
// --------------------------------------------------------------------------------------

jutils.dom.byId = function( id ) {
	if( document.all ) {
		return document.all[ id ];
	}
	return document.getElementById( id );
}

jutils.dom.removeChildren = function( element ) {
	if( ! element ) return

	while( element.hasChildNodes() ) {
		element.removeChild( element.childNodes[ 0 ] )
	}
}

jutils.dom.createElement = function( name, parameters, style, innerHTML ) {
	var element = document.createElement( name )
	if( parameters ) {
		for( parameter in parameters ) {
			element[ parameter ] = parameters[ parameter ]
		}
	}
	if( style ) {
		for( parameter in style ) {
			element.style[ parameter ] = style[ parameter ]
		}
	}
	if( innerHTML ) {
		element.innerHTML = innerHTML
	}
	return element
}

/**
 * "Walks" all the subnodes of this node.
 *
 * If the function callOnElement returns anything that is not false the "walk" will stop
 * there, and the result will be returned from the main function.
 */
jutils.dom.walkSubtree = function( element, callOnElement ) {
	if( element && callOnElement ) {
		var result = callOnElement( element )
		if( result )
			return result

		if( element.childNodes ) {
			for( i in element.childNodes ) {
				var result = jutils.dom.walkSubtree( element.childNodes[ i ], callOnElement )
				if( result )
					return result
			}
		}
	}
}

/**
 * Unline walkTree(), this method walks the current branch. I.e, from the current element
 * to the root. If callOnElement returns a non-false result the "walk" will stop there
 * and this value will be returned by this method.
 */
jutils.dom.walkBranch = function( element, callOnElement ) {
	var currentElement = element
	while( currentElement && currentElement != document ) {

		var result = callOnElement( currentElement )

		if( result )
			return result

		if( currentElement.parentNode )
			currentElement = currentElement.parentNode
	}
}

/**
 * See jutils.dom.walkSubtree
 */
jutils.dom.walk = function( callOnElement ) {
	return jutils.dom.walkSubtree( document.documentElement, callOnElement )
}

// --------------------------------------------------------------------------------------
// ajax
// --------------------------------------------------------------------------------------

jutils.ajax.getXmlHttpRequest = function() {
	var xmlHttp = false
	try {
		xmlHttp = new ActiveXObject("Msxml2.XMLHTTP")
	}
	catch( e ) {
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP")
		}
		catch( e2 ) {
			xmlHttp = false
		}
	}
	if( ! xmlHttp && typeof XMLHttpRequest != 'undefined' ) {
		xmlHttp = new XMLHttpRequest()
	}
	return xmlHttp
}

jutils.ajax.call = function( method, url, parameters, onResult, options ) {
	if( ! options )
		options = new Object()

	// Set defaults:
	if( ! ( 'blockPage' in options ) )
		options.blockPage = true
	if( ! ( 'keepBlocked' in options ) )
		options.keepBlocked = false

	// Block page imediately, otherwise the ajax result may come before the block happens
	if( options.blockPage )
		jutils.misc.blockPage( "Just a moment, please...", { 'showCloseLink': false } )

	if( ! parameters )
		parameters = {}

	reqParams = ''
	for( key in parameters ) {
		reqParams += key + '=' + escape( parameters[ key ] ) + '&'
	}

	var xmlHttp = jutils.ajax.getXmlHttpRequest()

	xmlHttp.onreadystatechange = function() {

		if( xmlHttp.readyState == 4 ) {

			if( onResult ) {
				onResult( xmlHttp.responseText )
			}

			if( options.blockPage && ! options.keepBlocked )
				jutils.misc.unblockPage()
		}
	}

	if( method == 'POST' ) {
		xmlHttp.open( 'POST', url );
		xmlHttp.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
		xmlHttp.send( reqParams );
	} else {
		if( reqParams )
			url += '?' + reqParams

		xmlHttp.open( 'GET', url )
		xmlHttp.send( null )
	}
}

jutils.ajax.post = function( url, parameters, onResult, options ) {
	return jutils.ajax.call( 'POST', url, parameters, onResult, options )
}

jutils.ajax.get = function( url, parameters, onResult, options ) {
	return jutils.ajax.call( 'GET', url, parameters, onResult, options )
}

jutils.ajax.formSubmit = function( url, formElement, onResult, options ) {
	return jutils.ajax.post( url, jutils.misc.getFormParameters( formElement ), onResult, options )
}

// --------------------------------------------------------------------------------------
// Utils:
// --------------------------------------------------------------------------------------

jutils.misc.parseJson = function( data ) {
	if( 'string' == typeof data ) {
		return eval( '(' + data + ')' )
	}

	return data
}

/** The name of this method should be incrementAndGetMaxZIndex() */
jutils.misc.getAndIncrementMaxZIndex = function() {
	if( jutils.misc.maxZIndex ) {
		var result = jutils.misc.maxZIndex
		jutils.misc.maxZIndex += 1
		return result
	} else {
		jutils.misc.maxZIndex = 100000
		jutils.dom.walk( function( element ) {
			if( element.style && element.style.zIndex ) {
				var currentZIndex = parseInt( element.style.zIndex )
				if( currentZIndex > jutils.misc.maxZIndex )
					jutils.misc.maxZIndex = currentZIndex + 1
			}
		} )

		return jutils.misc.getAndIncrementMaxZIndex()
	}
}

jutils.misc.addListener = function( element, event, _function ) {
	if( element && element.addEventListener ) {
		element.addEventListener( event, _function, false )
	} else if( element.attachEvent ) {
		element.attachEvent( "on" + event, _function )
	}
}

jutils.misc.removeListener = function( element, event, _function ) {
	if( element && element.removeEventListener ) {
		element.removeEventListener( event, _function, false )
	} else if( element.detachEvent ) {
		element.detachEvent( "on" + event, _function )
	}
}

jutils.misc.getElementPosition = function( element ) {
	var curleft = curtop = 0;

	if( element.offsetParent ) {
		do {
			curleft += element.offsetLeft
			curtop += element.offsetTop
		}
		while( element = element.offsetParent )

		return [ curleft, curtop ]
	}

	return null
}

jutils.misc.initBlockPageDivs = function() {
	if( ! jutils.dom.byId( 'blockDiv' ) ) {
		var blockPageDiv = jutils.dom.createElement( 'div', { 'id': 'blockDiv' }, {}, '' )
		var blockPageDivContent = jutils.dom.createElement( 'div', { 'id': 'blockDivContent' }, {}, '' )

		var body = document.getElementsByTagName( 'body' )[ 0 ]
		body.appendChild( blockPageDiv )
		body.appendChild( blockPageDivContent )

		// When, for example, the div contains an image, it will be resizes only when the image
		// size is known. So we must check the size
		blockPageDivContent.checkPosition = function() {
			var width = this.offsetWidth
			var height = this.offsetHeight 

			var bodyWidth = document.body.offsetWidth
			var bodyHeight = document.body.offsetHeight

			this.style.left = ( ( bodyWidth - width ) / 2 ) + 'px'

			// TODO
			// this.style.top = ( ( bodyHeight - height ) / 2 ) + 'px'

			this.style.top = '40px'

			this.timeout = setTimeout( 'jutils.dom.byId("blockDivContent").checkPosition()', 100 )
		}

		blockPageDivContent.stopCheckingPosition = function() {
			if( this.timeout ) {
				clearTimeout( this.timeout )
			}
		}
	}
}

jutils.misc.blockPage = function( content, options ) {
	jutils.misc.initBlockPageDivs()

	if( ! options )
		options = new Object()

	// Defaults:
	if( ! ( 'showCloseLink' in options ) )
		options.showCloseLink = true
	if( ! ( 'width' in options ) )
		options.width = '100px'
	if( ! ( 'height' in options ) )
		options.height = null
	if( ! ( 'top' in options ) )
		options.top = '100px'
	if( ! ( 'left' in options ) )
		options.left = '100px'
	// If true -- click on the background will close the "blocking" layer
	if( ! ( 'closeOnClick' in options ) )
		options.closeOnClick = false

	var blockDiv = document.getElementById( "blockDiv" )
	var blockDivContent = document.getElementById( "blockDivContent" )

	if( options.closeOnClick ) {
		popup.register
		jutils.misc.addListener( blockDiv, 'click', jutils.misc.unblockPage )
	}

	blockDivContent.checkPosition()

	var normalBrowser = navigator.userAgent.indexOf( 'MSIE' ) < 0
	if( normalBrowser ) {
		blockDiv.style.position = 'fixed'
		blockDivContent.style.position = 'fixed'
		blockDiv.style.top = '0%'
		blockDiv.style.left = '0%'
		blockDiv.style.width = '100%'
		blockDiv.style.height = '100%'
	} else {
		blockDiv.style.position = 'absolute'
		blockDivContent.style.position = 'absolute'
		blockDiv.style.top = '0px'
		blockDiv.style.left = '0px'
		blockDiv.style.width = document.body.offsetWidth + 'px'
		blockDiv.style.height = document.body.offsetHeight + 'px'
		blockDivContent.style.paddingTop = document.documentElement.scrollTop + 'px'
	}

	if( ! content ) {
		content = ''
	}

	if( options.showCloseLink ) {
		content += '<div id="blockDivClose"><a href="javascript:void(jutils.misc.unblockPage())"><img src="https://github.com/tkrajina/jutils.js/raw/master/close.png" style="border:none" /></a></div>' 
	}

	jutils.dom.removeChildren( blockDivContent )

	blockDivContent.innerHTML = '<div class="blockDivMessage">' + content + '</div>'

	blockDiv.style.zIndex = jutils.misc.getAndIncrementMaxZIndex()
	blockDivContent.style.zIndex = jutils.misc.getAndIncrementMaxZIndex()

	blockDiv.style.display = 'block'
	blockDivContent.style.display = 'block'

	// TODO
	// blockDivContent.style.width = options.width
	// blockDivContent.style.height = options.height
	blockDivContent.style.border = '1px solid black'
}

jutils.misc.unblockPage = function() {
	var blockDiv = document.getElementById( "blockDiv" )
	var blockDivContent = document.getElementById( "blockDivContent" )

	blockDiv.style.display = 'none'
	blockDivContent.style.display = 'none'

	blockDivContent.stopCheckingPosition()
}

jutils.misc.redirectIf = function( question, url ) {
	if( confirm( question ) ) {
		document.location = url
	}
}

jutils.misc.getFormParameters = function( formElement ) {
	result = {}
	for( i in formElement.elements ) {
		var name = formElement.elements[ i ].name
		var value = formElement.elements[ i ].value
		if( name && value ) {
			result[ name ] = value
		}
	}
	return result
}

// --------------------------------------------------------------------------------------
// events:
// --------------------------------------------------------------------------------------

/**
 * Returns the target element for an event.
 */
jutils.misc.getTarget = function( event ) {
	if( event.srcElement ) {
		return event.srcElement
	}
	return event.target
}

/**
 * May be used to obtain event position on MouseEvent for browsers that don't have pageX and pageY properties.
 */
jutils.events.getPosition = function( event ) {
	var x = null
	var y = null

	if( 'pageX' in event ) {
		x = event.pageX
		y = event.pageY
	}
	else if( 'clientX' in event ) {
		if( 'documentElement' in document && 'scrollLeft' in document.documentElement ) {
			x = event.clientX + document.documentElement.scrollLeft
			y = event.clientY + document.documentElement.scrollTop
		}
		else {
			x = event.clientX + document.body.scrollLeft
			y = event.clientY + document.body.scrollTop
		}
	}

	return [ x, y ]
}

// --------------------------------------------------------------------------------------
// html:
// --------------------------------------------------------------------------------------

jutils.html.getComputedStyle = function( element, style ) {
	if( element.currentStyle )
		return element.currentStyle[ style ]
	else if( window.getComputedStyle )
		return document.defaultView.getComputedStyle( element, null ).getPropertyValue( style )
}

jutils.html.hasClass = function( element, className ) {
	if( ! element.className ) {
		return false
	}
	var classes = element.className.split( /\s+/ )
	for( i in classes ) {
		if( className == classes[ i ] ) {
			return true
		}
	}
	return false
}

jutils.html.addClass = function( element, className ) {
	if( ! element.className ) {
		element.className = className
		return
	}
	var classes = element.className.split( /\s+/ )
	classes.push( className )
	element.className = classes.join( ' ' )
}

jutils.html.removeClass = function( element, className ) {
	if( ! element.className ) {
		return
	}
	var classes = element.className.split( /\s+/ )
	var result = new Array()
	for( i in classes ) {
		if( classes[ i ] != className ) {
			result.push( classes[ i ] )
		}
	}
	element.className = result.join( ' ' )
}

jutils.html.addMouseOverClass = function( element, className ) {
	jutils.misc.addListener( element, 'mouseover', function() { jutils.html.addClass( element, className ) } )
	jutils.misc.addListener( element, 'mouseout', function() { jutils.html.removeClass( element, className ) } )
}

// TODO

// Dok je na meniItemu ili meniju -- prikaže se
// Kad izađe -- čeka .75 sekunde da se obriše
// Kad se otvori bilo koji meni -- ostali se zatvaraju

/** Contains menu items. Every menuItem has a menuBody property. */
jutils.popup.registeredMenus = []
jutils.popup.currentMenuId = 1

/**
 * Menu registration. Every menu must have a subelement with class="menuBody" which is a
 * submenu to be shown.
 */
jutils.popup.registerMenu = function( element ) {
	// Find the first subElement with class 'menuBody':
	var subMenu = jutils.dom.walkSubtree( element, function( subElement ) {
		if( jutils.html.hasClass( subElement, 'menuBody' ) ) {
			return subElement
		}
	} )

	// Store submenu, and register it:
	if( subMenu ) {
		jutils.misc.addListener( element, 'mouseover', jutils.popup.showMenuByEvent )
		jutils.misc.addListener( element, 'mouseout', jutils.popup.startHidingMenuByEvent )

		element.menuBody = subMenu
		jutils.popup.registeredMenus.push( element )
	}
}

/** For private use */
jutils.popup.showMenuByEvent = function( event ) {
	jutils.popup.showMenu( jutils.misc.getTarget( event ) )
}

/** For private use */
jutils.popup.startHidingMenuByEvent = function( event ) {
	jutils.popup.startHidingMenu( jutils.misc.getTarget( event ) )
}

/**
 * Hides all menus. The option exceptMenu is optional. 
 */
jutils.popup.hideAllMenus = function( exceptMenu ) {
	for( i in jutils.popup.registeredMenus ) {
		var menu = jutils.popup.registeredMenus[ i ]
		if( ! exceptMenu || menu != exceptMenu ) {
			menu.menuBody.style.visibility = 'hidden'
		}
	}
}

/**
 * Just shows the menu.
 */
jutils.popup.showMenu = function( element ) {

	// remove evenual hiding timeout for this menu
	if( jutils.popup.hideMenuTimeout )
		clearTimeout( jutils.popup.hideMenuTimeout )

	// This event may occur on the menu or on the menu body or on any of their chidren
	var menuBody = jutils.dom.walkBranch( element, function( el ) {
		for( i in jutils.popup.registeredMenus ) {
			var menu = jutils.popup.registeredMenus[ i ]
			if( menu.menuBody == el ) {
				return el
			}
		}
	} )

	// If this event is on menu body, then everything is already OK
	if( menuBody ) 
		return

	var menuItem = jutils.dom.walkBranch( element, function( el ) {
		for( i in jutils.popup.registeredMenus ) {
			var menu = jutils.popup.registeredMenus[ i ]
			if( menu == el ) {
				return el
			}
		}
	} )

	// hide all other menus
	jutils.popup.hideAllMenus()

	// Show and position the menu body:

	menuItem.menuBody.style.visibility = 'visible'
	menuItem.menuBody.style.left = '0px'
	menuItem.menuBody.style.top = menuItem.offsetHeight + 1 + 'px'
	menuItem.menuBody.style.zIndex = jutils.misc.getAndIncrementMaxZIndex()
}

/**
 * Hides the menu .75 seconds from now. Stores the timeout object
 */
jutils.popup.startHidingMenu = function( element ) {
	jutils.popup.hideMenuTimeout = setTimeout( 'jutils.popup.hideAllMenus()', 750 );
}

jutils.popup.tooltipText = null
jutils.popup.tooltipTimeout = null

/**
 * Will register a popup for this element. 
 * 
 * If the textOrFunction is a string then the tooltip will be filled with this string.
 * 
 * If the textOrFunction is a function, the the function will be executed (the only
 * argument is the event) and the result will be filled in the tooltip.
 */
jutils.popup.registerTooltip = function( element, textOrFunction, options ) {

	if( ! options )
		options = new Object()

	if( ! ( 'timeout' in options ) )
		options.timeout = 500

	jutils.popup.initTooltipDiv()
	jutils.misc.addListener( element, 'mousemove', function( event ) {

		jutils.popup.hideTooltip()

		var clientPosition = jutils.events.getPosition( event )
		var elementPosition = jutils.misc.getElementPosition( element )

		jutils.popup.tooltipTimeoutOrFunction = textOrFunction
		jutils.popup.tooltipEvent = event

		// Position on screen:
		jutils.popup.tooltipX = clientPosition[ 0 ]
		jutils.popup.tooltipY = clientPosition[ 1 ]

		// Position on element:
		jutils.popup.positionX = clientPosition[ 0 ] - elementPosition[ 0 ]
		jutils.popup.positionY = clientPosition[ 1 ] - elementPosition[ 1 ]

		jutils.popup.tooltipTimeout = setTimeout( 'jutils.popup.showTooltip()', options.timeout )
	} )
	jutils.misc.addListener( element, 'mouseout', function( event ) {
		jutils.popup.hideTooltip()
	} )
}

jutils.popup.initTooltipDiv = function() {
	if( ! jutils.dom.byId( 'tooltip' ) ) {
		var tooltipDiv = jutils.dom.createElement( 'div', { 'id': 'tooltip' }, {}, '' )
		var body = document.getElementsByTagName( 'body' )[ 0 ]
		body.appendChild( tooltipDiv )
	}
}

jutils.popup.showTooltip = function() {
	var tooltip = jutils.dom.byId( 'tooltip' )
	tooltip.style.visibility = 'visible'
	tooltip.style.left = jutils.popup.tooltipX + 20 + 'px'
	tooltip.style.top = jutils.popup.tooltipY + 'px'

	if( jutils.popup.tooltipTimeoutOrFunction ) {
		if( 'string' == typeof jutils.popup.tooltipTimeoutOrFunction ) {
			var text = jutils.popup.tooltipTimeoutOrFunction
		} else {
			var text = jutils.popup.tooltipTimeoutOrFunction( jutils.popup.positionX, jutils.popup.positionY )
		}

		tooltip.innerHTML = text
	}
	else {
		tooltip.innerHTML = '?'
	}
}

jutils.popup.hideTooltip = function() {
	if( jutils.popup.tooltipTimeout )
		clearTimeout( jutils.popup.tooltipTimeout )

	var tooltip = jutils.dom.byId( 'tooltip' )
	tooltip.style.visibility = 'hidden'
}

/** Initializes and returns the top message DIV. */
jutils.popup.getTopMessage = function() {
	var topMessageDiv = jutils.dom.byId( 'topMessage' )

	if( ! topMessageDiv ) {
		topMessageDiv = jutils.dom.createElement( 'div', { 'id': 'topMessage' }, null, '' )
		var body = document.getElementsByTagName( 'body' )[ 0 ]
		body.insertBefore( topMessageDiv, body.childNodes[ 0 ] )
	}

	// Position on center:
	var width = jutils.html.getComputedStyle( topMessageDiv, 'width' )
	width = parseInt( width )

	var bodyWidth = document.body.offsetWidth

	topMessageDiv.style.left = ( ( bodyWidth - width ) / 2 ) + 'px'

	return topMessageDiv
}

jutils.popup.showTopMessage = function( text, options ) {

	if( ! options )
		options = new Object()

	if( ! ( 'autoClose' in options ) )
		options.autoClose = true
	if( ! ( 'autoCloseTimeout' in options ) )
		options.autoCloseTimeout = 5000
	if( ! ( 'closeOnClick' in options ) )
		options.closeOnClick = true

	var topMessageDiv = jutils.popup.getTopMessage()

	topMessageDiv.innerHTML = text

	if( options.autoClose ) {
		topMessageDiv.timeout = setTimeout( 'jutils.dom.byId("topMessage").style.visibility="hidden"', options.autoCloseTimeout )
	}

	jutils.misc.addListener( topMessageDiv, 'click', function() {
		var topMessageDiv = jutils.popup.getTopMessage()
		if( topMessage.closeOnClick ) {
			jutils.popup.hideTopMessage()
		}
	} )

	topMessageDiv.closeOnClick = options.closeOnClick

	topMessageDiv.style.visibility = 'visible'
	topMessageDiv.style.zIndex = jutils.misc.getAndIncrementMaxZIndex()
}

jutils.popup.hideTopMessage = function() {
	var topMessageDiv = jutils.popup.getTopMessage()
	if( topMessageDiv ) {
		topMessageDiv.style.visibility = 'hidden'
		if( topMessageDiv.timeout ) {
			clearTimeout( topMessageDiv.timeout )
		}
	}
}

// --------------------------------------------------------------------------------------
// transformations:
// --------------------------------------------------------------------------------------

jutils.transformations = new Object()

jutils.transformations.transformationObjects = []

jutils.transformations.transform = function( element, style, from, to, steps ) {
	if( ! steps ) {
		var steps = 100
	}
	if( ! element.transformationSteps ) {
		element.transformationSteps = {}
	}
	if( ! ( style in element.transformationSteps ) ) {
		element.transformationSteps[ style ] = []
	}

	var _from = Math.min( from, to )
	var _to = Math.max( from, to )
	var step = ( _to - _from ) / steps
	for( i = _from; i < _to; i += step ) {
		element.transformationSteps[ style ].push( i + 'px' )
	}

	var found = false
	for( i in jutils.transformations.transformationObjects ) {
		if( jutils.transformations.transformationObjects[ i ] == element ) {
			found = true
		}
	}
	if( ! found ) {
		jutils.transformations.transformationObjects.push( element )
	}
}

jutils.transformations.executeTransformationStep = function( element ) {

	if( ! element.transformationSteps ) {
		return false
	}

	var executed = false

	for( style in element.transformationSteps ) {
		if( element.transformationSteps[ style ] ) {
			var value = element.transformationSteps[ style ].pop()
			if( value ) {
				element.style[ style ] = value
				executed = true
			}
		}
	}

	return executed
}

jutils.transformations.execute = function() {
	var executed = false
	for( i in jutils.transformations.transformationObjects ) {
		var element = jutils.transformations.transformationObjects[ i ]
		executed = jutils.transformations.executeTransformationStep( element ) || executed
	}
	if( executed ) {
		setTimeout( 'jutils.transformations.execute()', 20 )
	}
}
